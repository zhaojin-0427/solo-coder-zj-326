from rest_framework import serializers
from .models import Term, Pronunciation, Annotation, Version


class PronunciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pronunciation
        fields = '__all__'


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = '__all__'


class VersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Version
        fields = '__all__'


class TermSerializer(serializers.ModelSerializer):
    pronunciation_count = serializers.SerializerMethodField()
    annotation_count = serializers.SerializerMethodField()
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Term
        fields = '__all__'

    def get_pronunciation_count(self, obj):
        return obj.pronunciations.count()

    def get_annotation_count(self, obj):
        return obj.annotations.count()

    def get_version_count(self, obj):
        return obj.versions.count()


class TermDetailSerializer(TermSerializer):
    pronunciations = PronunciationSerializer(many=True, read_only=True)
    annotations = AnnotationSerializer(many=True, read_only=True)
    versions = VersionSerializer(many=True, read_only=True)
