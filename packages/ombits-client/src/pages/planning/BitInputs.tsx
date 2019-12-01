import React, { Fragment } from 'react';

import {
  ADD_NEW_BIT_BELOW,
  INDENT_BIT,
  UNINDENT_BIT,
  UPDATE_BIT_TITLE,
} from './action-types';
import { State } from './interfaces';

interface Props {
  bitIds: string[];
  dispatch: any;
  isShiftPressed: boolean;
  parentBitId?: string;
  state: State;
}

export const BitInputs: React.FC<Props> = props => {
  const { bitIds, dispatch, isShiftPressed, parentBitId, state } = props;

  // Get the normalized bit objects from the store
  const bits = bitIds.map(id => state.bits[id]);

  return (
    <div>
      {bits.map(bit => {
        // Setup the payload for easy use
        const payload = {
          id: bit.id,
          level: bit.level,
          bitAboveId: bit.id,
          parentBitId,
        };

        return (
          <Fragment key={bit.id}>
            <div style={{ marginLeft: `${bit.level * 16 * 2}px` }}>
              <input
                id={bit.id}
                value={bit.title}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    if (isShiftPressed) {
                      dispatch({ type: UNINDENT_BIT, payload });
                    } else {
                      dispatch({ type: INDENT_BIT, payload });
                    }
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    dispatch({ type: ADD_NEW_BIT_BELOW, payload });
                  }
                }}
                onChange={e => {
                  const title = e.currentTarget.value;
                  dispatch({
                    type: UPDATE_BIT_TITLE,
                    payload: { id: bit.id, title },
                  });
                }}
              />
            </div>
            {bit.bits && (
              <BitInputs
                bitIds={bit.bits}
                dispatch={dispatch}
                isShiftPressed={isShiftPressed}
                parentBitId={bit.id}
                state={state}
              />
            )}
          </Fragment>
        );
      })}

      <style jsx>{`
        input {
          background: none;
          border: none;
          font-size: 30px;
          margin-bottom: 10px;
          opacity: 0.4;
          outline: none;
          transition: opacity 0.2s ease;
        }

        input:focus {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
