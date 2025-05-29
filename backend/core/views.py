from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from billing.models import Bill, Payment
from complaints.models import Complaint
from homes.models import Home
from residents.models import Resident

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    # Use role field to distinguish admin and union leader
    user_role = getattr(request.user, 'role', None)
    is_union_leader = user_role == 'union_leader'
    is_admin = user_role == 'admin'

    today = timezone.now()
    thirty_days_ago = today - timedelta(days=30)

    # Get residents for this union leader
    residents = Resident.objects.filter(union_leader=request.user) if is_union_leader else Resident.objects.all()

    # Get billing stats
    if is_union_leader:
        total_bills = Bill.objects.filter(resident__in=residents, created_at__gte=thirty_days_ago)
    else:
        total_bills = Bill.objects.filter(created_at__gte=thirty_days_ago)
    total_amount = total_bills.aggregate(total=Sum('amount'))['total'] or 0
    total_paid = total_bills.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    total_pending = total_amount - total_paid

    # Get occupancy stats (whole society)
    total_homes = Home.objects.count()
    occupied_homes = Home.objects.filter(status='occupied').count()
    vacant_homes = total_homes - occupied_homes
    occupancy_rate = (occupied_homes / total_homes * 100) if total_homes > 0 else 0

    # Get complaint stats
    if is_union_leader:
        total_complaints = Complaint.objects.filter(resident__in=residents, created_at__gte=thirty_days_ago).count()
        pending_complaints = Complaint.objects.filter(resident__in=residents, created_at__gte=thirty_days_ago, status='pending').count()
        resolved_complaints = Complaint.objects.filter(resident__in=residents, created_at__gte=thirty_days_ago, status='resolved').count()
    else:
        total_complaints = Complaint.objects.filter(created_at__gte=thirty_days_ago).count()
        pending_complaints = Complaint.objects.filter(created_at__gte=thirty_days_ago, status='pending').count()
        resolved_complaints = Complaint.objects.filter(created_at__gte=thirty_days_ago, status='resolved').count()

    # Get recent activity
    if is_union_leader:
        recent_bills = Bill.objects.filter(resident__in=residents).order_by('-created_at')[:5]
        recent_payments = Payment.objects.filter(bill__resident__in=residents).order_by('-created_at')[:5]
        recent_complaints = Complaint.objects.filter(resident__in=residents).order_by('-created_at')[:5]
    else:
        recent_bills = Bill.objects.order_by('-created_at')[:5]
        recent_payments = Payment.objects.order_by('-created_at')[:5]
        recent_complaints = Complaint.objects.order_by('-created_at')[:5]

    return Response({
        'billing': {
            'total_amount': total_amount,
            'total_paid': total_paid,
            'total_pending': total_pending,
            'collection_rate': (total_paid / total_amount * 100) if total_amount > 0 else 0
        },
        'occupancy': {
            'total_homes': total_homes,
            'occupied_homes': occupied_homes,
            'vacant_homes': vacant_homes,
            'occupancy_rate': occupancy_rate
        },
        'complaints': {
            'total': total_complaints,
            'pending': pending_complaints,
            'resolved': resolved_complaints,
            'resolution_rate': (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0
        },
        'recent_activity': {
            'bills': [{
                'id': bill.id,
                'amount': bill.amount,
                'bill_type': bill.bill_type,
                'status': bill.status,
                'created_at': bill.created_at
            } for bill in recent_bills],
            'payments': [{
                'id': payment.id,
                'amount': payment.amount,
                'status': payment.status,
                'created_at': payment.created_at
            } for payment in recent_payments],
            'complaints': [{
                'id': complaint.id,
                'title': complaint.title,
                'status': complaint.status,
                'created_at': complaint.created_at
            } for complaint in recent_complaints]
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resident_dashboard(request):
    resident = Resident.objects.filter(user=request.user).first()
    if not resident:
        return Response({'error': 'Resident not found'}, status=404)

    today = timezone.now()
    thirty_days_ago = today - timedelta(days=30)

    # Get billing stats
    bills = Bill.objects.filter(resident=resident)
    recent_bills = bills.filter(created_at__gte=thirty_days_ago)
    total_amount = recent_bills.aggregate(total=Sum('amount'))['total'] or 0
    total_paid = recent_bills.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    total_pending = total_amount - total_paid

    # Get complaint stats
    complaints = Complaint.objects.filter(resident=resident)
    recent_complaints = complaints.filter(created_at__gte=thirty_days_ago)
    total_complaints = recent_complaints.count()
    pending_complaints = recent_complaints.filter(status='pending').count()
    resolved_complaints = recent_complaints.filter(status='resolved').count()

    # Get recent activity
    recent_bills = bills.order_by('-created_at')[:5]
    recent_payments = Payment.objects.filter(bill__resident=resident).order_by('-created_at')[:5]
    recent_complaints = complaints.order_by('-created_at')[:5]

    return Response({
        'billing': {
            'total_amount': total_amount,
            'total_paid': total_paid,
            'total_pending': total_pending,
            'payment_rate': (total_paid / total_amount * 100) if total_amount > 0 else 0
        },
        'complaints': {
            'total': total_complaints,
            'pending': pending_complaints,
            'resolved': resolved_complaints,
            'resolution_rate': (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0
        },
        'recent_activity': {
            'bills': [{
                'id': bill.id,
                'amount': bill.amount,
                'bill_type': bill.bill_type,
                'status': bill.status,
                'due_date': bill.due_date,
                'created_at': bill.created_at
            } for bill in recent_bills],
            'payments': [{
                'id': payment.id,
                'amount': payment.amount,
                'status': payment.status,
                'created_at': payment.created_at
            } for payment in recent_payments],
            'complaints': [{
                'id': complaint.id,
                'title': complaint.title,
                'status': complaint.status,
                'created_at': complaint.created_at
            } for complaint in recent_complaints]
        }
    })
