from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .db import list_learners, get_learner_by_id
from .serializers import LearnerSerializer


class LearnerListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        learners = list_learners()
        serializer = LearnerSerializer(learners, many=True)
        return Response(serializer.data)


class LearnerDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, learner_id):
        learner = get_learner_by_id(learner_id)
        if learner is None:
            return Response({"error": "Learner not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LearnerSerializer(learner)
        return Response(serializer.data)
