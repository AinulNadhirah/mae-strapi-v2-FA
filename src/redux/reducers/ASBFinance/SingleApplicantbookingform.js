import { createSlice } from "@reduxjs/toolkit";

const SingleApplicantbookingform = createSlice({
    name: "SingleApplicantbookingform",
    initialState: {
        Data: {
            images: [],
            statusSuccessfull: false,
            nricFrontImages: [],
            nricBackImages: [],
        },
    },
    reducers: {
        singleApplicantbookingreducer: (state, action) => {
            state.Data.images = [...state.Data.images, ...action.payload];
        },
        singleApplicantbookingDeletereducer: (state, action) => {
            const filteredData = state.Data.images.filter((data) => data.id !== action.payload);
            state.Data.images = filteredData;
        },
        doneWithDataPush: (state, action) => {
            state.Data = {
                images: [],
                nricFrontImages: [],
                nricBackImages: [],
                statusSuccessfull: false,
            };
        },
        nricFrontApplicantbookingreducer: (state, action) => {
            state.Data.nricFrontImages = [...state.Data.nricFrontImages, ...action.payload];
        },
        nricBackApplicantbookingreducer: (state, action) => {
            state.Data.nricBackImages = [...state.Data.nricBackImages, ...action.payload];
        },
        nricFrontApplicantbookingDeletereducer: (state, action) => {
            const filteredData = state.Data.nricFrontImages.filter(
                (data) => data.id !== action.payload
            );
            state.Data.nricFrontImages = filteredData;
        },
        nricBackApplicantbookingDeletereducer: (state, action) => {
            const filteredData = state.Data.nricBackImages.filter(
                (data) => data.id !== action.payload
            );
            state.Data.nricBackImages = filteredData;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    singleApplicantbookingreducer,
    singleApplicantbookingDeletereducer,
    doneWithDataPush,
    nricFrontApplicantbookingreducer,
    nricBackApplicantbookingreducer,
    nricFrontApplicantbookingDeletereducer,
    nricBackApplicantbookingDeletereducer,
} = SingleApplicantbookingform.actions;

export default SingleApplicantbookingform.reducer;
