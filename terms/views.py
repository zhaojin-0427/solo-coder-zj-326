from django.db.models import Count
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Term, Pronunciation, Annotation, Version, Story, StoryRevision
from .serializers import (
    TermSerializer, TermDetailSerializer, PronunciationSerializer,
    AnnotationSerializer, VersionSerializer, StorySerializer,
    StoryDetailSerializer, StoryRevisionSerializer,
)


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
            from django.db.models import Q
            queryset = queryset.filter(Q(tags__icontains=f'"{tag}"') | Q(tags__icontains=tag))
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
        })
