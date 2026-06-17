import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Signal } from "@/types";

interface SignalState {
  signals: Signal[];
  selected: Signal | null;
  isLoading: boolean;
  total: number;
}

const initialState: SignalState = {
  signals: [],
  selected: null,
  isLoading: false,
  total: 0,
};

const signalSlice = createSlice({
  name: "signals",
  initialState,
  reducers: {
    setSignals(state, action: PayloadAction<{ signals: Signal[]; total: number }>) {
      state.signals = action.payload.signals;
      state.total = action.payload.total;
    },
    addSignal(state, action: PayloadAction<Signal>) {
      state.signals.unshift(action.payload);
      state.total += 1;
    },
    setSelected(state, action: PayloadAction<Signal | null>) {
      state.selected = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setSignals, addSignal, setSelected, setLoading } = signalSlice.actions;
export default signalSlice.reducer;