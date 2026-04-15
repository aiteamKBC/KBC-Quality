from rest_framework import serializers
from .models import Action, ActionComment


class ActionCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = ActionComment
        fields = ['id', 'author', 'author_name', 'text', 'created_at']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return None


class ActionSerializer(serializers.ModelSerializer):
    comments = ActionCommentSerializer(many=True, read_only=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Action
        fields = '__all__'

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.username
        return None
