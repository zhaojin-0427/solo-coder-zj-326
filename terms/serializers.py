from rest_framework import serializers
from .models import Location, Term, Pronunciation, Annotation, Version, Story, StoryRevision


class LocationSerializer(serializers.ModelSerializer):
    term_count = serializers.SerializerMethodField()
    story_count = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = '__all__'

    def get_term_count(self, obj):
        return obj.terms.count()

    def get_story_count(self, obj):
        return obj.stories.count()


class LocationDetailSerializer(LocationSerializer):
    top_terms = serializers.SerializerMethodField()
    representative_story = serializers.SerializerMethodField()
    related_family_members = serializers.SerializerMethodField()
    recent_revisions = serializers.SerializerMethodField()

    def get_top_terms(self, obj):
        top = obj.terms.all()[:10]
        return [{'id': t.id, 'word': t.word, 'meaning': t.meaning, 'category': t.category} for t in top]

    def get_representative_story(self, obj):
        story = obj.stories.first()
        if story:
            return {'id': story.id, 'title': story.title, 'era': story.era, 'narrator': story.narrator}
        return None

    def get_related_family_members(self, obj):
        members = set(obj.family_members or [])
        for story in obj.stories.all():
            for m in (story.family_members or []):
                members.add(m)
        return sorted(members)

    def get_recent_revisions(self, obj):
        from django.db.models import Q
        story_ids = obj.stories.values_list('id', flat=True)
        revisions = StoryRevision.objects.filter(story_id__in=story_ids).order_by('-created_at')[:5]
        return [{'id': r.id, 'story': r.story_id, 'change_note': r.change_note, 'contributed_by': r.contributed_by, 'created_at': r.created_at.isoformat() if r.created_at else None} for r in revisions]

    def create(self, validated_data):
        location = Location.objects.create(**validated_data)
        location_ids = self.initial_data.get('locations', [])
        return location

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


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


class TermLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'region', 'latitude', 'longitude']


class TermSerializer(serializers.ModelSerializer):
    pronunciation_count = serializers.SerializerMethodField()
    annotation_count = serializers.SerializerMethodField()
    version_count = serializers.SerializerMethodField()
    location_count = serializers.SerializerMethodField()

    class Meta:
        model = Term
        fields = '__all__'

    def get_pronunciation_count(self, obj):
        return obj.pronunciations.count()

    def get_annotation_count(self, obj):
        return obj.annotations.count()

    def get_version_count(self, obj):
        return obj.versions.count()

    def get_location_count(self, obj):
        return obj.locations.count()

    def create(self, validated_data):
        location_ids = self.initial_data.get('locations', [])
        if isinstance(location_ids, str):
            location_ids = [int(x) for x in location_ids.split(',') if x.strip()]
        elif location_ids is None:
            location_ids = []
        validated_data.pop('locations', None)
        term = Term.objects.create(**validated_data)
        if location_ids:
            term.locations.set(location_ids)
        return term

    def update(self, instance, validated_data):
        location_ids = self.initial_data.get('locations', None)
        if location_ids is not None:
            if isinstance(location_ids, str):
                location_ids = [int(x) for x in location_ids.split(',') if x.strip()]
            elif location_ids is None:
                location_ids = []
            instance.locations.set(location_ids)
        validated_data.pop('locations', None)
        return super().update(instance, validated_data)


class TermDetailSerializer(TermSerializer):
    pronunciations = PronunciationSerializer(many=True, read_only=True)
    annotations = AnnotationSerializer(many=True, read_only=True)
    versions = VersionSerializer(many=True, read_only=True)
    locations = TermLocationSerializer(many=True, read_only=True)


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
    location_count = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = '__all__'

    def get_related_terms_count(self, obj):
        return obj.related_terms.count()

    def get_revision_count(self, obj):
        return obj.revisions.count()

    def get_location_count(self, obj):
        return obj.locations.count()

    def create(self, validated_data):
        related_term_ids = self.initial_data.get('related_terms', [])
        if isinstance(related_term_ids, str):
            related_term_ids = [int(x) for x in related_term_ids.split(',') if x.strip()]
        elif related_term_ids is None:
            related_term_ids = []
        location_ids = self.initial_data.get('locations', [])
        if isinstance(location_ids, str):
            location_ids = [int(x) for x in location_ids.split(',') if x.strip()]
        elif location_ids is None:
            location_ids = []
        validated_data.pop('related_terms', None)
        validated_data.pop('locations', None)
        story = Story.objects.create(**validated_data)
        if related_term_ids:
            story.related_terms.set(related_term_ids)
        if location_ids:
            story.locations.set(location_ids)
        return story

    def update(self, instance, validated_data):
        related_term_ids = self.initial_data.get('related_terms', None)
        if related_term_ids is not None:
            if isinstance(related_term_ids, str):
                related_term_ids = [int(x) for x in related_term_ids.split(',') if x.strip()]
            elif related_term_ids is None:
                related_term_ids = []
            instance.related_terms.set(related_term_ids)
        location_ids = self.initial_data.get('locations', None)
        if location_ids is not None:
            if isinstance(location_ids, str):
                location_ids = [int(x) for x in location_ids.split(',') if x.strip()]
            elif location_ids is None:
                location_ids = []
            instance.locations.set(location_ids)
        validated_data.pop('related_terms', None)
        validated_data.pop('locations', None)
        return super().update(instance, validated_data)


class StoryDetailSerializer(StorySerializer):
    related_terms = RelatedTermSerializer(many=True, read_only=True)
    revisions = StoryRevisionSerializer(many=True, read_only=True)
    locations = TermLocationSerializer(many=True, read_only=True)
