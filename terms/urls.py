from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TermViewSet, PronunciationViewSet, AnnotationViewSet, VersionViewSet, StatisticsAPIView

router = DefaultRouter()
router.register(r'terms', TermViewSet)
router.register(r'pronunciations', PronunciationViewSet)
router.register(r'annotations', AnnotationViewSet)
router.register(r'versions', VersionViewSet)

urlpatterns = [
    path('statistics/', StatisticsAPIView.as_view()),
    path('', include(router.urls)),
]
