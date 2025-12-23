from django.contrib import admin

from .models import (IoTData, QuizFact, QuizMood, QuizQuestion, QuizResult,
                     QuizResultMessage, SystemSetting)


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "value", "description", "updated_at")
    list_editable = ("value",)
    search_fields = ("key", "description")


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ("order", "question_preview", "correct_answer", "is_active")
    list_editable = ("order", "is_active")
    list_display_links = ("question_preview",)
    search_fields = ("question",)

    def question_preview(self, obj):
        return obj.question[:50] + "..."

    question_preview.short_description = "Question"


@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ("user_display", "score", "total_questions", "percentage", "completed_at")
    list_filter = ("completed_at",)

    def user_display(self, obj):
        return obj.user.username if obj.user else "Anonymous"

    user_display.short_description = "User"


@admin.register(QuizFact)
class QuizFactAdmin(admin.ModelAdmin):
    list_display = ("text_preview", "is_active", "created_at")
    list_editable = ("is_active",)

    def text_preview(self, obj):
        return obj.text[:50] + "..."


@admin.register(QuizMood)
class QuizMoodAdmin(admin.ModelAdmin):
    list_display = ("emoji", "text", "min_percentage", "color")
    list_editable = ("min_percentage",)


@admin.register(QuizResultMessage)
class QuizResultMessageAdmin(admin.ModelAdmin):
    list_display = ("min_percentage", "title", "emoji", "color_class")
    list_editable = ("title", "color_class")


@admin.register(IoTData)
class IoTDataAdmin(admin.ModelAdmin):
    list_display = ("id", "hardware_sensor_id", "cpu_usage", "ram_usage", "eco_score", "created_at")
    list_filter = ("hardware_sensor_id", "created_at")
    search_fields = ("hardware_sensor_id", "energy_sensor_id", "network_sensor_id")
