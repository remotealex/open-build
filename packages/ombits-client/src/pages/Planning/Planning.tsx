import React, { useReducer, useState, Reducer, useEffect } from 'react';
import { EditableTitle, Wrapper } from 'om-ui';
import { useKey } from 'react-use';
import { useQuery, useMutation } from '@apollo/react-hooks';
import NProgress from 'nprogress';

import { normalizeBits } from '../../utils/normalize-bits';
import { initialState } from './initial-state';
import { reducer } from './reducer';
import { BitInputs } from './BitInputs';
import { State, Payload } from './interfaces';
import { Action } from '../../interfaces/action';
import { GET_PROJECT } from '../../queries/projects';
import { UPDATE_PROJECT_TITLE } from '../../mutations/projects';

interface Props {
  projectId: string;
}

export const Planning: React.FC<Props> = ({ projectId }) => {
  const { loading, error, data } = useQuery(GET_PROJECT, {
    variables: { _id: projectId },
  });
  const [updateTitle] = useMutation(UPDATE_PROJECT_TITLE);

  // Bits can be deeply nested so we normalize them first
  const { entities, result } = normalizeBits(initialState.bits);

  // Then we setup the reducer
  const [state, dispatch] = useReducer<Reducer<State, Action<Payload>>>(
    reducer,
    {
      bits: entities.bits,
      result,
    },
  );

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (data && data.project) {
      setTitle(data.project.title);
    }
  }, [data]);

  // Track if the Shift key is being held
  const [isShiftPressed, setShiftPressedState] = useState(false);
  useKey('Shift', () => setShiftPressedState(true), { event: 'keydown' });
  useKey('Shift', () => setShiftPressedState(false), { event: 'keyup' });

  // Keeping for reference for now

  // console.log('bits:', state.bits);
  // console.log(denormalizeBits(state.result, { bits: state.bits }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error :(</div>;

  // console.log(data);

  return (
    <section>
      <Wrapper>
        <div className="editable-title--full-width">
          <EditableTitle
            as="h2"
            value={title}
            marginBottom={3}
            onChange={setTitle}
            onBlur={async (isChanged: boolean) => {
              if (isChanged) {
                NProgress.start();
                await updateTitle({ variables: { projectName: title } });
                NProgress.done();
              }
            }}
          />
        </div>
        <BitInputs
          bitIds={state.result}
          dispatch={dispatch}
          isShiftPressed={isShiftPressed}
          state={state}
        />
      </Wrapper>

      <style jsx>{`
        section {
          padding-top: 80px;
        }
      `}</style>
      <style jsx global>{`
        .editable-title--full-width > input {
          width: 100%;
        }
      `}</style>
    </section>
  );
};
