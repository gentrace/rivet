import { DefaultValue, atom, selector } from 'recoil';
import { persistAtom } from './persist';
import { nanoid } from 'nanoid';
import { values } from '../utils/typeSafety';
import produce from 'immer';
import { GraphId, NodeGraph, Project, ProjectId } from '@ironclad/nodai-core';

export const savedGraphsState = selector<NodeGraph[]>({
  key: 'savedGraphsState',
  get: ({ get }) => {
    const project = get(projectState);
    return values(project.graphs);
  },
  set: ({ set, get }, newValue) => {
    if (newValue instanceof DefaultValue) {
      return;
    }

    const project = get(projectState);
    const newProject = produce(project, (draft) => {
      draft.graphs = {};
      for (const graph of newValue) {
        if (graph.metadata == null) {
          graph.metadata = {
            id: nanoid() as GraphId,
            name: 'Untitled Graph',
            description: '',
          };
        } else if (graph.metadata.id == null) {
          graph.metadata.id = nanoid() as GraphId;
        }

        draft.graphs[graph.metadata!.id!] = graph;
      }
    });

    set(projectState, newProject);
  },
});

export const projectState = atom<Project>({
  key: 'projectState',
  default: {
    metadata: {
      id: nanoid() as ProjectId,
      description: '',
      title: 'Untitled Project',
    },
    graphs: {},
  },
  effects_UNSTABLE: [persistAtom],
});