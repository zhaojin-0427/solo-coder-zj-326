from django.contrib import admin
from .models import Term, Pronunciation, Annotation, Version


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ['word', 'era', 'category', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'era', 'category']


@admin.register(Pronunciation)
class PronunciationAdmin(admin.ModelAdmin):
    list_display = ['term', 'ipa_notation', 'role', 'contributed_by', 'created_at']
    list_filter = ['role']


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ['term', 'type', 'role', 'contributed_by', 'created_at']
    list_filter = ['type', 'role']


@admin.register(Version)
class VersionAdmin(admin.ModelAdmin):
    list_display = ['term', 'interpretation', 'is_common', 'role', 'contributed_by', 'created_at']
    list_filter = ['is_common', 'role']
