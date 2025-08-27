
"""
Revision ID: 20250826_add_pending_approval_to_tasks
Revises: cba1b73193c6
Create Date: 2025-08-26
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250826_add_pending_approval_to_tasks'
down_revision = 'cba1b73193c6'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('tasks', sa.Column('pending_approval', sa.Integer(), nullable=False, server_default='0'))

def downgrade():
    op.drop_column('tasks', 'pending_approval')
