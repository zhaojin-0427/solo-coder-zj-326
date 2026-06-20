from django.db import models


class Location(models.Model):
    name = models.CharField(max_length=200)
    region = models.CharField(max_length=200, blank=True, default='')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    era_start = models.CharField(max_length=50, blank=True, default='')
    era_end = models.CharField(max_length=50, blank=True, default='')
    family_members = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Term(models.Model):
    STATUS_CHOICES = [
        ('pending', '待确认'),
        ('confirmed', '已确认'),
        ('needs_revision', '需修订'),
    ]

    word = models.CharField(max_length=100)
    pronunciation_placeholder = models.CharField(max_length=200, blank=True, default='')
    meaning = models.TextField(blank=True, default='')
    usage_scene = models.TextField(blank=True, default='')
    era = models.CharField(max_length=50, blank=True, default='')
    category = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=20, default='pending', choices=STATUS_CHOICES)
    created_by = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    locations = models.ManyToManyField('Location', blank=True, related_name='terms')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.word


class Pronunciation(models.Model):
    ROLE_CHOICES = [
        ('elder', '长辈'),
        ('youth', '晚辈'),
    ]

    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='pronunciations')
    ipa_notation = models.CharField(max_length=200, blank=True, default='')
    tone_description = models.CharField(max_length=200, blank=True, default='')
    phonetic_spelling = models.CharField(max_length=200, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    contributed_by = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=10, default='elder', choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"发音备注 - {self.term}"


class Annotation(models.Model):
    TYPE_CHOICES = [
        ('example_sentence', '例句'),
        ('kinship_term', '人物关系称呼'),
        ('synonym', '近义词'),
        ('mandarin_translation', '普通话对照'),
        ('image_association', '图片联想'),
        ('family_note', '家庭备注'),
    ]
    ROLE_CHOICES = [
        ('elder', '长辈'),
        ('youth', '晚辈'),
    ]

    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='annotations')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    content = models.TextField()
    extra_data = models.JSONField(default=dict, blank=True)
    contributed_by = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=10, default='elder', choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"注解 - {self.term} ({self.get_type_display()})"


class Version(models.Model):
    ROLE_CHOICES = [
        ('elder', '长辈'),
        ('youth', '晚辈'),
    ]

    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='versions')
    interpretation = models.TextField()
    scope = models.CharField(max_length=200, blank=True, default='')
    is_common = models.BooleanField(default=False)
    contributed_by = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=10, default='elder', choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"释义 - {self.term}"


class Story(models.Model):
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('pending_elder_confirm', '待长辈确认'),
        ('organized', '已整理'),
        ('needs_supplement', '需补充'),
    ]

    title = models.CharField(max_length=200)
    narrator = models.CharField(max_length=100, blank=True, default='')
    recorder = models.CharField(max_length=100, blank=True, default='')
    location = models.CharField(max_length=200, blank=True, default='')
    era = models.CharField(max_length=50, blank=True, default='')
    content = models.TextField()
    mandarin_summary = models.TextField(blank=True, default='')
    original_fragments = models.TextField(blank=True, default='')
    elder_revision_notes = models.TextField(blank=True, default='')
    family_members = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    related_terms = models.ManyToManyField(Term, blank=True, related_name='related_stories')
    locations = models.ManyToManyField('Location', blank=True, related_name='stories')
    status = models.CharField(max_length=30, default='draft', choices=STATUS_CHOICES)
    created_by = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class StoryRevision(models.Model):
    ROLE_CHOICES = [
        ('elder', '长辈'),
        ('youth', '晚辈'),
    ]

    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='revisions')
    field_name = models.CharField(max_length=100, blank=True, default='')
    old_value = models.TextField(blank=True, default='')
    new_value = models.TextField(blank=True, default='')
    change_note = models.CharField(max_length=500, blank=True, default='')
    contributed_by = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=10, default='youth', choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"修订 - {self.story.title} ({self.contributed_by or '匿名'})"
