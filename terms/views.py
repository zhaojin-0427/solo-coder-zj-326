from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Location, Term, Pronunciation, Annotation, Version, Story, StoryRevision
from .serializers import (
    LocationSerializer, LocationDetailSerializer,
    TermSerializer, TermDetailSerializer, PronunciationSerializer,
    AnnotationSerializer, VersionSerializer, StorySerializer,
    StoryDetailSerializer, StoryRevisionSerializer,
)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filterset_fields = ['region']
    search_fields = ['name', 'region', 'description']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LocationDetailSerializer
        return LocationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        era = self.request.query_params.get('era')
        if era:
            queryset = queryset.filter(Q(era_start=era) | Q(era_end=era) | Q(era_start__lte=era, era_end__gte=era))
        family_member = self.request.query_params.get('family_member')
        if family_member:
            queryset = queryset.filter(Q(family_members__icontains=family_member) | Q(stories__family_members__icontains=family_member)).distinct()
        narrator = self.request.query_params.get('narrator')
        if narrator:
            queryset = queryset.filter(stories__narrator__icontains=narrator).distinct()
        term_category = self.request.query_params.get('term_category')
        if term_category:
            queryset = queryset.filter(terms__category=term_category).distinct()
        story_tag = self.request.query_params.get('story_tag')
        if story_tag:
            queryset = queryset.filter(stories__tags__icontains=story_tag).distinct()
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.terms.exists() or instance.stories.exists():
            term_count = instance.terms.count()
            story_count = instance.stories.count()
            return Response(
                {
                    'detail': '该地点仍有关联内容，无法删除',
                    'term_count': term_count,
                    'story_count': story_count,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class LocationFiltersAPIView(APIView):
    def get(self, request):
        regions = list(
            Location.objects.values_list('region', flat=True)
            .exclude(region='')
            .distinct()
            .order_by('region')
        )

        all_eras = set()
        for loc in Location.objects.all():
            if loc.era_start:
                all_eras.add(loc.era_start)
            if loc.era_end:
                all_eras.add(loc.era_end)

        all_members = set()
        for loc in Location.objects.all():
            for m in (loc.family_members or []):
                if m:
                    all_members.add(m)

        narrators = list(
            Story.objects.values_list('narrator', flat=True)
            .exclude(narrator='')
            .distinct()
            .order_by('narrator')
        )

        term_categories = list(
            Term.objects.values_list('category', flat=True)
            .exclude(category='')
            .distinct()
            .order_by('category')
        )

        all_story_tags = set()
        for story in Story.objects.all():
            for tag in (story.tags or []):
                if tag:
                    all_story_tags.add(tag)

        return Response({
            'regions': regions,
            'eras': sorted(all_eras),
            'family_members': sorted(all_members),
            'narrators': narrators,
            'term_categories': term_categories,
            'story_tags': sorted(all_story_tags),
        })


class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    filterset_fields = ['era', 'category', 'status']
    search_fields = ['word', 'meaning']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TermDetailSerializer
        return TermSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        has_versions = self.request.query_params.get('has_versions')
        if has_versions is not None:
            if has_versions.lower() in ('true', '1', 'yes'):
                queryset = queryset.annotate(version_cnt=Count('versions')).filter(version_cnt__gt=0)
            elif has_versions.lower() in ('false', '0', 'no'):
                queryset = queryset.annotate(version_cnt=Count('versions')).filter(version_cnt=0)
        location_id = self.request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(locations__id=location_id)
        return queryset


class PronunciationViewSet(viewsets.ModelViewSet):
    queryset = Pronunciation.objects.all()
    serializer_class = PronunciationSerializer
    filterset_fields = ['term', 'role']


class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer
    filterset_fields = ['term', 'type', 'role']


class VersionViewSet(viewsets.ModelViewSet):
    queryset = Version.objects.all()
    serializer_class = VersionSerializer
    filterset_fields = ['term', 'is_common', 'role']


class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    filterset_fields = ['narrator', 'era', 'status']
    search_fields = ['title', 'content', 'tags']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StoryDetailSerializer
        return StorySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        tag = self.request.query_params.get('tag')
        if tag:
            from django.db.models import Q as QMod
            queryset = queryset.filter(QMod(tags__icontains=f'"{tag}"') | QMod(tags__icontains=tag))
        location_id = self.request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(locations__id=location_id)
        return queryset


class StoryRevisionViewSet(viewsets.ModelViewSet):
    queryset = StoryRevision.objects.all()
    serializer_class = StoryRevisionSerializer
    filterset_fields = ['story', 'role']


class StoryFiltersAPIView(APIView):
    def get(self, request):
        narrators = list(
            Story.objects.values_list('narrator', flat=True)
            .exclude(narrator='')
            .distinct()
            .order_by('narrator')
        )

        all_tags = []
        for story_tags in Story.objects.values_list('tags', flat=True):
            if story_tags and isinstance(story_tags, list):
                for tag in story_tags:
                    if tag and tag not in all_tags:
                        all_tags.append(tag)

        return Response({
            'narrators': narrators,
            'tags': sorted(all_tags),
        })


class StatisticsAPIView(APIView):
    def get(self, request):
        category_distribution = {
            item['category']: item['count']
            for item in Term.objects.values('category').annotate(count=Count('id')).order_by('-count')
            if item['category']
        }

        polysemy_terms = Term.objects.annotate(version_count=Count('versions')).filter(version_count__gt=1).count()
        total_terms = Term.objects.count()
        polysemy_ratio = round(polysemy_terms / total_terms, 4) if total_terms > 0 else 0

        pending_count = Term.objects.filter(status='pending').count()
        confirmed_count = Term.objects.filter(status='confirmed').count()
        needs_revision_count = Term.objects.filter(status='needs_revision').count()
        pending_ratio = {
            'pending': pending_count,
            'confirmed': confirmed_count,
            'needs_revision': needs_revision_count,
            'total': pending_count + confirmed_count + needs_revision_count,
        }

        era_coverage = {
            item['era']: item['count']
            for item in Term.objects.values('era').annotate(count=Count('id')).order_by('-count')
            if item['era']
        }

        overview = {
            'total_terms': total_terms,
            'total_pronunciations': Pronunciation.objects.count(),
            'total_annotations': Annotation.objects.count(),
            'total_versions': Version.objects.count(),
            'pending_count': pending_count,
        }

        total_stories = Story.objects.count()
        organized_stories = Story.objects.filter(status='organized').count()
        organized_ratio = round(organized_stories / total_stories, 4) if total_stories > 0 else 0

        story_status_distribution = {
            'draft': Story.objects.filter(status='draft').count(),
            'pending_elder_confirm': Story.objects.filter(status='pending_elder_confirm').count(),
            'organized': organized_stories,
            'needs_supplement': Story.objects.filter(status='needs_supplement').count(),
            'total': total_stories,
        }

        story_era_coverage = {
            item['era']: item['count']
            for item in Story.objects.values('era').annotate(count=Count('id')).order_by('-count')
            if item['era']
        }

        top_related_terms_story = (
            Story.objects.annotate(terms_count=Count('related_terms'))
            .order_by('-terms_count')
            .first()
        )
        top_story_data = None
        if top_related_terms_story and top_related_terms_story.terms_count > 0:
            top_story_data = {
                'id': top_related_terms_story.id,
                'title': top_related_terms_story.title,
                'related_terms_count': top_related_terms_story.terms_count,
            }

        tag_counts: dict[str, int] = {}
        for story in Story.objects.all():
            for tag in story.tags or []:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        top_story_tags = sorted(tag_counts.items(), key=lambda x: -x[1])[:10]
        story_tag_distribution = [{'tag': tag, 'count': count} for tag, count in top_story_tags]

        overview['total_stories'] = total_stories

        story_statistics = {
            'total_stories': total_stories,
            'organized_ratio': organized_ratio,
            'organized_count': organized_stories,
            'status_distribution': story_status_distribution,
            'era_coverage': story_era_coverage,
            'top_related_terms_story': top_story_data,
            'tag_distribution': story_tag_distribution,
        }

        total_locations = Location.objects.count()
        all_eras_set = set()
        for loc in Location.objects.all():
            if loc.era_start:
                all_eras_set.add(loc.era_start)
            if loc.era_end:
                all_eras_set.add(loc.era_end)
        era_count = len(all_eras_set)

        top_terms_location = (
            Location.objects.annotate(terms_cnt=Count('terms'))
            .order_by('-terms_cnt')
            .first()
        )
        top_terms_location_data = None
        if top_terms_location and top_terms_location.terms_cnt > 0:
            top_terms_location_data = {
                'id': top_terms_location.id,
                'name': top_terms_location.name,
                'term_count': top_terms_location.terms_cnt,
            }

        top_stories_location = (
            Location.objects.annotate(stories_cnt=Count('stories'))
            .order_by('-stories_cnt')
            .first()
        )
        top_stories_location_data = None
        if top_stories_location and top_stories_location.stories_cnt > 0:
            top_stories_location_data = {
                'id': top_stories_location.id,
                'name': top_stories_location.name,
                'story_count': top_stories_location.stories_cnt,
            }

        region_distribution = {
            item['region']: item['count']
            for item in Location.objects.values('region').annotate(count=Count('id')).order_by('-count')
            if item['region']
        }

        total_content = total_terms + total_stories
        content_with_location = (
            Term.objects.filter(locations__isnull=False).distinct().count()
            + Story.objects.filter(locations__isnull=False).distinct().count()
        )
        content_without_location_ratio = round(1 - content_with_location / total_content, 4) if total_content > 0 else 0

        migration_map_statistics = {
            'total_locations': total_locations,
            'era_count': era_count,
            'top_terms_location': top_terms_location_data,
            'top_stories_location': top_stories_location_data,
            'region_distribution': region_distribution,
            'content_without_location_ratio': content_without_location_ratio,
            'content_without_location_count': total_content - content_with_location,
            'total_content_count': total_content,
        }

        return Response({
            'category_distribution': category_distribution,
            'polysemy_count': {
                'polysemy_count': polysemy_terms,
                'total_terms': total_terms,
                'ratio': polysemy_ratio,
            },
            'pending_ratio': pending_ratio,
            'era_coverage': era_coverage,
            'overview': overview,
            'story_statistics': story_statistics,
            'migration_map_statistics': migration_map_statistics,
        })
