import { NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

type FindableRepository<TEntity extends ObjectLiteral> = Pick<
  Repository<TEntity>,
  'findOne'
>;

function resolveNotFoundMessage(entityNameOrMessage: string) {
  return /not found/i.test(entityNameOrMessage)
    ? entityNameOrMessage
    : `${entityNameOrMessage} not found`;
}

export async function findOneOrThrow<TEntity extends ObjectLiteral>(
  repo: FindableRepository<TEntity>,
  where: FindOptionsWhere<TEntity> | FindOptionsWhere<TEntity>[],
  entityNameOrMessage: string,
) {
  const entity = await repo.findOne({ where });

  if (!entity) {
    throw new NotFoundException(
      resolveNotFoundMessage(entityNameOrMessage),
    );
  }

  return entity;
}

export async function findByIdOrThrow<
  TEntity extends ObjectLiteral & { id: string },
>(
  repo: FindableRepository<TEntity>,
  id: string,
  entityNameOrMessage: string,
) {
  return findOneOrThrow(
    repo,
    { id } as FindOptionsWhere<TEntity>,
    entityNameOrMessage,
  );
}
