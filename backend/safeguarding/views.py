from rest_framework import generics, permissions
from .models import SafeguardingCase
from .serializers import SafeguardingCaseSerializer


class SafeguardingCaseListCreateView(generics.ListCreateAPIView):
    queryset = SafeguardingCase.objects.all()
    serializer_class = SafeguardingCaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = SafeguardingCase.objects.all()
        case_status = self.request.query_params.get('status')
        severity = self.request.query_params.get('severity')
        if case_status:
            qs = qs.filter(status=case_status)
        if severity:
            qs = qs.filter(severity=severity)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SafeguardingCaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SafeguardingCase.objects.all()
    serializer_class = SafeguardingCaseSerializer
    permission_classes = [permissions.IsAuthenticated]
