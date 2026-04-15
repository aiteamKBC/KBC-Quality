from rest_framework import serializers


class AttendanceHistoryPointSerializer(serializers.Serializer):
    month = serializers.CharField()
    label = serializers.CharField()
    attended = serializers.IntegerField()
    missed = serializers.IntegerField()
    total = serializers.IntegerField()
    attendance_pct = serializers.FloatField()


class AttendanceSessionSerializer(serializers.Serializer):
    date = serializers.CharField()
    attendance = serializers.IntegerField()
    module = serializers.CharField()
    activity_pct = serializers.FloatField(allow_null=True)


class TimelineEventSerializer(serializers.Serializer):
    id = serializers.CharField()
    date = serializers.CharField()
    type = serializers.CharField()
    title = serializers.CharField()
    text = serializers.CharField()
    by = serializers.CharField()


class LearnerSerializer(serializers.Serializer):
    id                   = serializers.CharField()
    full_name            = serializers.CharField()
    email                = serializers.CharField()
    programme            = serializers.CharField()
    cohort               = serializers.CharField()
    employer             = serializers.CharField()
    employer_email       = serializers.CharField()
    employer_contact     = serializers.CharField()
    employer_id          = serializers.CharField()
    coach                = serializers.CharField()
    coach_email          = serializers.CharField()
    coach_id             = serializers.CharField()
    start_date           = serializers.CharField()
    expected_end_date    = serializers.CharField()
    attendance_pct       = serializers.FloatField()
    sessions_total       = serializers.IntegerField()
    sessions_attended    = serializers.IntegerField()
    sessions_missed      = serializers.IntegerField()
    otjh_logged          = serializers.FloatField()
    otjh_target          = serializers.FloatField()
    rag_status           = serializers.ChoiceField(choices=["Green", "Amber", "Red"])
    risk_flags           = serializers.ListField(child=serializers.CharField())
    is_active            = serializers.BooleanField()
    last_review          = serializers.CharField()
    next_review          = serializers.CharField()
    progress             = serializers.FloatField()
    # KPI counts
    total_comp_count     = serializers.IntegerField()
    completed_comp_count = serializers.IntegerField()
    target_comp_count    = serializers.IntegerField()
    total_target_ksb     = serializers.IntegerField()
    total_completed_ksb  = serializers.IntegerField()
    # Structured review list
    reviews              = serializers.ListField(child=serializers.DictField())
    attendance_history   = AttendanceHistoryPointSerializer(many=True, required=False)
    recent_sessions      = AttendanceSessionSerializer(many=True, required=False)
    summary_text         = serializers.CharField(required=False)
    timeline             = TimelineEventSerializer(many=True, required=False)
