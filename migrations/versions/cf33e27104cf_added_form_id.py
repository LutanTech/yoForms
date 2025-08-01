"""added form id

Revision ID: cf33e27104cf
Revises: 1939a9f0070a
Create Date: 2025-07-24 06:32:46.112136

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cf33e27104cf'
down_revision = '1939a9f0070a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('log', schema=None) as batch_op:
        batch_op.add_column(sa.Column('form_id', sa.String(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('log', schema=None) as batch_op:
        batch_op.drop_column('form_id')

    # ### end Alembic commands ###
