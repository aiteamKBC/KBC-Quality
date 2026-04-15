"""
Management command to create or update a KBC platform user.

Usage:
    python manage.py create_kbc_user
    python manage.py create_kbc_user --email admin@kentbc.ac.uk --password secret123 --role admin

The password is hashed with Django's PBKDF2-SHA256 algorithm before being
stored in the Neon PostgreSQL database. Plain-text passwords are NEVER persisted.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

DEFAULT_USERS = [
    {
        'first_name': 'Sarah',
        'last_name': 'Mitchell',
        'email': 'sarah.mitchell@kentbc.ac.uk',
        'username': 'sarah.mitchell',
        'password': 'demo1234',
        'role': 'quality_lead',
        'is_staff': True,
    },
    {
        'first_name': 'Admin',
        'last_name': 'KBC',
        'email': 'admin@kentbc.ac.uk',
        'username': 'admin',
        'password': 'admin1234',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    },
]


class Command(BaseCommand):
    help = 'Create or update KBC platform users with hashed passwords in the database'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='User email address')
        parser.add_argument('--username', type=str, help='Username (defaults to email prefix)')
        parser.add_argument('--password', type=str, help='Password (will be hashed before storage)')
        parser.add_argument('--first-name', type=str, default='')
        parser.add_argument('--last-name', type=str, default='')
        parser.add_argument('--role', type=str, default='admin',
                            choices=[r[0] for r in User.ROLE_CHOICES])
        parser.add_argument('--seed-defaults', action='store_true',
                            help='Create the default demo users for development')

    def handle(self, *args, **options):
        if options['seed_defaults']:
            for u in DEFAULT_USERS:
                self._create_or_update(
                    email=u['email'],
                    username=u['username'],
                    password=u['password'],
                    first_name=u['first_name'],
                    last_name=u['last_name'],
                    role=u['role'],
                    is_staff=u.get('is_staff', False),
                    is_superuser=u.get('is_superuser', False),
                )
            return

        email = options.get('email')
        password = options.get('password')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                '\nNo --email/--password supplied. Creating default demo users...'
            ))
            for u in DEFAULT_USERS:
                self._create_or_update(
                    email=u['email'],
                    username=u['username'],
                    password=u['password'],
                    first_name=u['first_name'],
                    last_name=u['last_name'],
                    role=u['role'],
                    is_staff=u.get('is_staff', False),
                    is_superuser=u.get('is_superuser', False),
                )
            return

        username = options.get('username') or email.split('@')[0]
        self._create_or_update(
            email=email,
            username=username,
            password=password,
            first_name=options.get('first_name', ''),
            last_name=options.get('last_name', ''),
            role=options.get('role', 'admin'),
        )

    def _create_or_update(self, email, username, password, first_name='',
                          last_name='', role='admin', is_staff=False, is_superuser=False):
        user, created = User.objects.get_or_create(
            email__iexact=email,
            defaults={'username': username},
        )

        user.username = username
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.role = role
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.is_active = True
        # set_password hashes the password with PBKDF2-SHA256 — never stored in plain text
        user.set_password(password)
        user.save()

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f'{action} user: {email} | role: {role} | '
            f'password stored as hashed in Neon PostgreSQL'
        ))
