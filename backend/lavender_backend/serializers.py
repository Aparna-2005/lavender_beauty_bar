
import re
from datetime import date

from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "service",
            "date",
            "time",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
        ]

    def validate_phone(self, value):
        # Remove spaces, hyphens, and an optional leading +.
        cleaned = re.sub(r"[\s\-+]", "", value)

        # Accept 10-digit Indian mobile numbers,
        # or numbers prefixed with country code 91.
        if not re.fullmatch(r"(?:91)?[6-9]\d{9}", cleaned):
            raise serializers.ValidationError(
                "Valid 10-digit mobile number kudunga."
            )

        return cleaned[-10:]

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError(
                "Past date select panna mudiyathu."
            )

        return value

    def validate(self, data):
        appointment_date = data.get("date")
        appointment_time = data.get("time")

        # Check for an existing booking in the same slot.
        if appointment_date and appointment_time:
            exists = Appointment.objects.filter(
                date=appointment_date,
                time=appointment_time,
            ).exclude(
                status__iexact="Cancelled"
            ).exists()

            if exists:
                raise serializers.ValidationError({
                    "time": (
                        "Intha time slot already book aagiduchu. "
                        "Vera time select pannunga."
                    )
                })

        return data
