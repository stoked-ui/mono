import * as React from 'react';
import Engine, { EngineState, IEngine } from "../Engine";
import {
  TimelineProviderProps,
  ITimelineState,
  initialTimelineState,
  TimelineReducer,
  TimelineContext,
  TimelineContextType, TimelineStateAction, getDbProps
} from './TimelineProvider.types';
import LocalDb, { initDb } from "../LocalDb";
import TimelineFile, { TimelineFileMeta } from "../TimelineFile";

function TimelineProvider<
  EngineType extends IEngine = IEngine,
  StateType extends ITimelineState = ITimelineState,
  StateActionType = TimelineStateAction
>(props: TimelineProviderProps<EngineType, StateType, StateActionType>) {
  const { children, id, controllers, engine } = props;

  const theEngine = engine ?? new Engine({ controllers  });
  const getState = () => {
    return theEngine.state as EngineState;
  }
  const setState = (newState: EngineState | string) => {
    theEngine.state = newState;
  }
  const initialState: ITimelineState = {
    ...initialTimelineState,
    id: id ?? 'timeline',
    engine: theEngine,
    getState,
    setState
  };

  const fileMeta = new TimelineFileMeta();
  const reducer = props.reducer ?? TimelineReducer;
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { flags } = state;
  React.useEffect(() => {

    if (!LocalDb.initialized) {
      LocalDb.init(props.localDb ? props.localDb : getDbProps(fileMeta, props.localDb));
    }

  }, [flags.includes('localDb')]);

  return (
    <TimelineContext.Provider value={React.useMemo(() => ({ ...state, dispatch }), [state, dispatch])}>
      {children}
    </TimelineContext.Provider>
  );
};

// Custom hook to access the extended context
function useTimeline(): TimelineContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}

export { TimelineProvider, useTimeline };

