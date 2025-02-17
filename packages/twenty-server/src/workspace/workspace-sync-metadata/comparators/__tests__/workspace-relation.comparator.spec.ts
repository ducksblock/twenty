import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';

import { WorkspaceRelationComparator } from 'src/workspace/workspace-sync-metadata/comparators/workspace-relation.comparator';

describe('WorkspaceRelationComparator', () => {
  let comparator: WorkspaceRelationComparator;

  beforeEach(() => {
    comparator = new WorkspaceRelationComparator();
  });

  function createMockRelationMetadata(values: any) {
    return {
      fromObjectMetadataId: 'object-1',
      fromFieldMetadataId: 'field-1',
      ...values,
    };
  }

  it('should generate CREATE action for new relations', () => {
    const original = [];
    const standard = [createMockRelationMetadata({})];

    const result = comparator.compare(original, standard);

    expect(result).toEqual([
      {
        action: ComparatorAction.CREATE,
        object: expect.objectContaining({
          fromObjectMetadataId: 'object-1',
          fromFieldMetadataId: 'field-1',
        }),
      },
    ]);
  });

  it('should generate DELETE action for removed relations', () => {
    const original = [createMockRelationMetadata({ id: '1' })];
    const standard = [];

    const result = comparator.compare(original, standard);

    expect(result).toEqual([
      {
        action: ComparatorAction.DELETE,
        object: expect.objectContaining({ id: '1' }),
      },
    ]);
  });

  it('should not generate any action for identical relations', () => {
    const relation = createMockRelationMetadata({});
    const original = [{ id: '1', ...relation }];
    const standard = [relation];

    const result = comparator.compare(original, standard);

    expect(result).toHaveLength(0);
  });
});
