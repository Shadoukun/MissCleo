"""rename macro_commands to custom_commands

Revision ID: 76110e69ef78
Revises: f1c4e9d2fb1f
Create Date: 2020-05-16 17:38:04.936678

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '76110e69ef78'
down_revision = 'f1c4e9d2fb1f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.rename_table('macro_commands', 'custom_commands')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.rename_table('custom_commands', 'macro_commands')
    # ### end Alembic commands ###
