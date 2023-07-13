import { createSlice } from "@reduxjs/toolkit";

const SingleApplicantReducer = createSlice({
    name: "SingleapplicantReducer",
    initialState: {
        Data: {
            images: [],
            statusSuccessfull: false,
        },
    },
    reducers: {
        singleApplicantreducer: (state, action) => {
            state.Data.images = [...state.Data.images, ...action.payload];
        },
        singleApplicantDeletereducer: (state, action) => {
            const filteredData = state.Data.images.filter((data) => data.id !== action.payload);
            state.Data.images = filteredData;
        },
        Donewithdatapush: (state, action) => {
            state.Data = {
                images: [],
                statusSuccessfull: false,
            };
        },
    },
});

// Action creators are generated for each case reducer function
export const { singleApplicantreducer, singleApplicantDeletereducer, Donewithdatapush } =
    SingleApplicantReducer.actions;

export default SingleApplicantReducer.reducer;
