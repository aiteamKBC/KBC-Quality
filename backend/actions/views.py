from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Action, ActionComment
from .serializers import ActionSerializer, ActionCommentSerializer


class ActionListCreateView(generics.ListCreateAPIView):
    queryset = Action.objects.all()
    serializer_class = ActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Action.objects.all()
        action_status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        category = self.request.query_params.get('category')
        learner_id = self.request.query_params.get('learner_id')
        if action_status:
            qs = qs.filter(status=action_status)
        if priority:
            qs = qs.filter(priority=priority)
        if category:
            qs = qs.filter(category=category)
        if learner_id:
            qs = qs.filter(linked_learner_id=learner_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ActionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Action.objects.all()
    serializer_class = ActionSerializer
    permission_classes = [permissions.IsAuthenticated]


class ActionCommentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            action = Action.objects.get(pk=pk)
        except Action.DoesNotExist:
            return Response({"error": "Action not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActionCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(action=action, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
