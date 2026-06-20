from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    TermViewSet, PronunciationViewSet, AnnotationViewSet,
    VersionViewSet, StatisticsAPIView, StoryViewSet, StoryRevisionViewSet,
    StoryFiltersAPIView, LocationViewSet, LocationFiltersAPIView,
    HeritageTaskViewSet, HeritageTaskFiltersAPIView,
)

router = DefaultRouter()
router.register(r'terms', TermViewSet)
router.register(r'pronunciations', PronunciationViewSet)
router.register(r'annotations', AnnotationViewSet)
router.register(r'versions', VersionViewSet)
router.register(r'stories', StoryViewSet)
router.register(r'story-revisions', StoryRevisionViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'heritage-tasks', HeritageTaskViewSet)

urlpatterns = [
    path('statistics/', StatisticsAPIView.as_view()),
    path('story-filters/', StoryFiltersAPIView.as_view()),
    path('location-filters/', LocationFiltersAPIView.as_view()),
    path('heritage-task-filters/', HeritageTaskFiltersAPIView.as_view()),
    path('', include(router.urls)),
]
