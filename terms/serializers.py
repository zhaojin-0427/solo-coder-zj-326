from rest_framework import serializers
from .models import Term, Pronunciation, Annotation, Version, Story, StoryRevision


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


class StoryRevisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryRevision
        fields = '__all__'


class RelatedTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ['id', 'word', 'pronunciation_placeholder', 'meaning', 'annotation_count']

    annotation_count = serializers.SerializerMethodField()

    def get_annotation_count(self, obj):
        return obj.annotations.count()


class StorySerializer(serializers.ModelSerializer):
    related_terms_count = serializers.SerializerMethodField()
    revision_count = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = '__all__'

    def get_related_terms_count(self, obj):
        return obj.related_terms.count()

    def get_revision_count(self, obj):
        return obj.revisions.count()


class StoryDetailSerializer(StorySerializer):
    related_terms = RelatedTermSerializer(many=True, read_only=True)
    revisions = StoryRevisionSerializer(many=True, read_only=True)

    def create(self, validated_data):
        related_term_ids = self.initial_data.get('related_terms', [])
        if isinstance(related_term_ids, str):
            related_term_ids = [int(x) for x in related_term_ids.split(',') if x.strip()]
        elif related_term_ids is None:
            related_term_ids = []
        validated_data.pop('related_terms', None)
        story = Story.objects.create(**validated_data)
        if related_term_ids:
            story.related_terms.set(related_term_ids)
        return story

    def update(self, instance, validated_data):
        related_term_ids = self.initial_data.get('related_terms', None)
        if related_term_ids is not None:
            if isinstance(related_term_ids, str):
                related_term_ids = [int(x) for x in related_term_ids.split(',') if x.strip()]
            elif related_term_ids is None:
                related_term_ids = []
            instance.related_terms.set(related_term_ids)
        validated_data.pop('related_terms', None)
        return super().update(instance, validated_data)
