"""
Run ONCE to fix InconsistentMigrationHistory / schema mismatch errors.

1. Deletes stale migration files from our custom apps
2. Drops all Django-managed tables (kbc_users_data is NOT touched)
3. Recreates migrations and applies them cleanly
"""
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection

CUSTOM_APPS = ['users', 'employers', 'evidence', 'actions', 'safeguarding']

TABLES_TO_DROP = [
    'token_blacklist_blacklistedtoken',
    'token_blacklist_outstandingtoken',
    'users_login_audit',
    'users_user_groups',
    'users_user_user_permissions',
    'users_user',
    'employers_employer',
    'evidence_evidence',
    'actions_actioncomment',
    'actions_action',
    'safeguarding_safeguardingcase',
    'django_admin_log',
    'django_session',
    'auth_user_user_permissions',
    'auth_user_groups',
    'auth_user',
    'auth_group_permissions',
    'auth_group',
    'auth_permission',
    'django_content_type',
    'django_migrations',
]


class Command(BaseCommand):
    help = 'Full clean reset — drops Django tables and recreates from scratch'

    def handle(self, *args, **options):
        # ── Step 1: delete stale migration files ────────────────────────────
        self.stdout.write('Step 1: Removing stale migration files...')
        base = Path(__file__).resolve().parents[4]  # backend/
        for app in CUSTOM_APPS:
            migrations_dir = base / app / 'migrations'
            for f in migrations_dir.glob('[0-9]*.py'):
                f.unlink()
                self.stdout.write(f'  deleted {app}/migrations/{f.name}')
        self.stdout.write(self.style.SUCCESS('  Done.\n'))

        # ── Step 2: drop all Django-managed tables ───────────────────────────
        self.stdout.write('Step 2: Dropping Django-managed tables...')
        with connection.cursor() as cursor:
            for table in TABLES_TO_DROP:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                self.stdout.write(f'  dropped {table}')
        self.stdout.write(self.style.SUCCESS('  Done.\n'))

        # ── Step 3: generate fresh migration files ───────────────────────────
        self.stdout.write('Step 3: Generating migration files...')
        call_command('makemigrations', *CUSTOM_APPS, verbosity=1)
        self.stdout.write(self.style.SUCCESS('  Done.\n'))

        # ── Step 4: apply all migrations ────────────────────────────────────
        self.stdout.write('Step 4: Applying all migrations...')
        call_command('migrate', verbosity=1)
        self.stdout.write(self.style.SUCCESS('  Done.\n'))

        self.stdout.write(self.style.SUCCESS(
            'All done! Now run:\n'
            '  python manage.py create_kbc_user --seed-defaults\n'
            '  python manage.py runserver\n'
        ))
