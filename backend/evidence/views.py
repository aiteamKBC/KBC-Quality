from rest_framework import generics, permissions
from .models import Evidence
from .serializers import EvidenceSerializer


class EvidenceListCreateView(generics.ListCreateAPIView):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Evidence.objects.all()
        category = self.request.query_params.get('category')
        review_status = self.request.query_params.get('review_status')
        learner_id = self.request.query_params.get('learner_id')
        if category:
            qs = qs.filter(category=category)
        if review_status:
            qs = qs.filter(review_status=review_status)
        if learner_id:
            qs = qs.filter(linked_learner_id=learner_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class EvidenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]
