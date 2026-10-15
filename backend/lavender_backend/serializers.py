import re
from datetime import date
from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "id", "name", "phone", "email", "service",
            "date", "time", "message", "status", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_phone(self, value):
        cleaned = re.sub(r"[\s\-+]", "", value)
        if not re.fullmatch(r"(91)?[6-9]\d{9}", cleaned):
            raise serializers.ValidationError("Valid 10-digit mobile number kudunga.")
        return cleaned[-10:]

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Past date select panna mudiyathu.")
        return value

    def validate(self, data):
        exists = Appointment.objects.filter(
            date=data["date"], time=data["time"]
        ).exclude(status="Cancelled").exists()
        if exists:
            raise serializers.ValidationError(
                {"time": "Intha time slot already book aagiduchu. Vera time select pannunga."}
            )
        return data