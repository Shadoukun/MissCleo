"""migrate to postgres

Revision ID: 786387e0de51
Revises: 18b24c92d541
Create Date: 2020-05-21 21:35:52.586143

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '786387e0de51'
down_revision = '18b24c92d541'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('idx_17988_sqlite_autoindex_custom_commands_1', table_name='custom_commands')

    op.create_unique_constraint(None, 'custom_commands', ['command'])

    op.drop_index('idx_18000_sqlite_autoindex_custom_reactions_1', table_name='custom_reactions')

    op.create_unique_constraint(None, 'custom_reactions', ['trigger'])

    op.drop_index('idx_17994_sqlite_autoindex_custom_responses_1', table_name='custom_responses')

    op.create_unique_constraint(None, 'custom_responses', ['trigger'])

    op.create_unique_constraint('uq_guild_membership', 'guild_membership', ['user_id', 'guild_id'])

    op.drop_index('idx_18027_sqlite_autoindex_guild_membership_2', table_name='guild_membership')

    op.create_foreign_key('fk_top_role_id', 'guild_membership', 'roles', ['top_role_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('fk_top_role_id', 'guild_membership', type_='foreignkey')
    op.create_index('idx_18027_sqlite_autoindex_guild_membership_2', 'guild_membership', ['user_id', 'guild_id'], unique=True)
    op.drop_constraint('uq_guild_membership', 'guild_membership', type_='unique')
    op.drop_constraint(None, 'custom_responses', type_='unique')
    op.create_index('idx_17994_sqlite_autoindex_custom_responses_1', 'custom_responses', ['trigger'], unique=True)
    op.drop_constraint(None, 'custom_reactions', type_='unique')
    op.create_index('idx_18000_sqlite_autoindex_custom_reactions_1', 'custom_reactions', ['trigger'], unique=True)
    op.drop_constraint(None, 'custom_commands', type_='unique')
    op.create_index('idx_17988_sqlite_autoindex_custom_commands_1', 'custom_commands', ['command'], unique=True)
    # ### end Alembic commands ###