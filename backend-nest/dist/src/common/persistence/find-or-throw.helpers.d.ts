import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
type FindableRepository<TEntity extends ObjectLiteral> = Pick<Repository<TEntity>, 'findOne'>;
export declare function findOneOrThrow<TEntity extends ObjectLiteral>(repo: FindableRepository<TEntity>, where: FindOptionsWhere<TEntity> | FindOptionsWhere<TEntity>[], entityNameOrMessage: string): Promise<TEntity>;
export declare function findByIdOrThrow<TEntity extends ObjectLiteral & {
    id: string;
}>(repo: FindableRepository<TEntity>, id: string, entityNameOrMessage: string): Promise<TEntity>;
export {};
