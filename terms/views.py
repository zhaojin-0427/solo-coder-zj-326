from django.db.models import Count
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Term, Pronunciation, Annotation, Version
from .serializers import TermSerializer, TermDetailSerializer, PronunciationSerializer, AnnotationSerializer, VersionSerializer


class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    filterset_fields = ['era', 'category', 'status']
    search_fields = ['word', 'meaning']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TermDetailSerializer
        return TermSerializer


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
        })
