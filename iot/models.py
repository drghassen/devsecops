from django.contrib.auth.models import User
from django.db import models


class IoTData(models.Model):

    # ---------- HARDWARE ----------
    hardware_sensor_id = models.CharField(max_length=50)
    hardware_timestamp = models.BigIntegerField()

    age_years = models.IntegerField()
    cpu_usage = models.IntegerField()
    ram_usage = models.IntegerField()
    battery_health = models.FloatField()
    os = models.CharField(max_length=20)
    win11_compat = models.BooleanField()

    # ---------- ENERGY ----------
    energy_sensor_id = models.CharField(max_length=50)
    energy_timestamp = models.BigIntegerField()

    power_watts = models.IntegerField()
    active_devices = models.IntegerField()
    overheating = models.IntegerField()
    co2_equiv_g = models.IntegerField()

    # ---------- NETWORK ----------
    network_sensor_id = models.CharField(max_length=50)
    network_timestamp = models.BigIntegerField()

    network_load_mbps = models.IntegerField()
    requests_per_min = models.IntegerField()
    cloud_dependency_score = models.IntegerField()

    # ---------- SCORES ----------
    eco_score = models.IntegerField()
    obsolescence_score = models.IntegerField()
    bigtech_dependency = models.IntegerField()
    co2_savings_kg_year = models.IntegerField()
    recommendations = models.JSONField(default=dict, blank=True)

    # ---------- TIMESTAMP ENREGISTREMENT ----------
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"IoT Data {self.id} - {self.created_at}"


class QuizQuestion(models.Model):
    """Model for storing quiz questions in the database"""

    question = models.TextField(help_text="The question text")
    options = models.JSONField(help_text="List of 4 answer options")
    correct_answer = models.IntegerField(help_text="Index of correct answer (0-3)")
    reactions_correct = models.JSONField(default=list, help_text="List of reactions to show on correct answer")
    reactions_wrong = models.JSONField(default=list, help_text="List of reactions to show on wrong answer")
    fun_fact = models.TextField(blank=True, help_text="Fun fact displayed after answering")
    order = models.IntegerField(default=0, help_text="Display order of the question")
    is_active = models.BooleanField(default=True, help_text="Whether this question is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"Q{self.order}: {self.question[:50]}..."


class QuizResult(models.Model):
    """Model for storing user quiz results"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quiz_results", null=True, blank=True)
    score = models.IntegerField(help_text="Number of correct answers")
    total_questions = models.IntegerField(help_text="Total questions answered")
    percentage = models.FloatField(help_text="Score as percentage")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'}: {self.score}/{self.total_questions}"


class QuizFact(models.Model):
    """Model for storing random quiz facts"""

    text = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50]


class QuizMood(models.Model):
    """Model for storing quiz moods (emoji, text, background color)"""

    emoji = models.CharField(max_length=10)
    text = models.CharField(max_length=100)
    color = models.CharField(max_length=50, help_text="CSS color value (e.g. rgba(...))")
    min_percentage = models.IntegerField(help_text="Minimum score percentage for this mood")

    class Meta:
        ordering = ["min_percentage"]

    def __str__(self):
        return f"{self.emoji} {self.text}"


class QuizResultMessage(models.Model):
    """Model for storing final result messages based on score percentage"""

    min_percentage = models.IntegerField(unique=True)
    title = models.CharField(max_length=200)
    message = models.TextField()
    emoji = models.CharField(max_length=10)
    color_class = models.CharField(max_length=20, help_text="Bootstrap color class (success, warning, etc.)")
    badge_text = models.CharField(max_length=100)

    class Meta:
        ordering = ["min_percentage"]

    def __str__(self):
        return f"{self.min_percentage}%: {self.title}"


class SystemSetting(models.Model):
    """Model for storing dynamic system settings (thresholds, URLs, etc.)"""

    key = models.CharField(max_length=100, unique=True, help_text="Setting key (e.g. cpu_threshold)")
    value = models.CharField(max_length=500, help_text="Setting value")
    description = models.TextField(blank=True, help_text="Description of what this setting does")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value}"
