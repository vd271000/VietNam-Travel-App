import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userData: {},
  purchasedHotels: [],
  purchasedFlights: [], 
  purchasedCars: [], 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserTickets(state, action) {
      state.purchasedHotels = action.payload.purchasedHotels;
      state.purchasedFlights = action.payload.purchasedFlights;
      state.purchasedCars = action.payload.purchasedCars;
    },
    loginSuccess(state, action) {
      state.isLoggedIn = true;
      state.userData = action.payload;
    },
    logoutSuccess(state) {
      state.isLoggedIn = false;
      state.userData = {};
      state.bookingInfo = {};
    },
    addPurchasedFlight: (state, action) => {
      state.purchasedFlights.push(action.payload);
    },
    removePurchasedFlight: (state, action) => {
      const { itineraryId } = action.payload;
      state.purchasedFlights = state.purchasedFlights.filter(
        (flight) => flight.itineraryId !== itineraryId
      );
    },     
    addPurchasedHotel(state, action) {
      state.purchasedHotels.push(action.payload);
    },
    removePurchasedHotel(state, action) {
      const hotelIndex = state.purchasedHotels.findIndex(
        hotel => hotel.hotelId === action.payload,
      );
      if (hotelIndex !== -1) {
        state.purchasedHotels.splice(hotelIndex, 1);
      }
    }, 
    addPurchasedCar(state, action) {
      state.purchasedCars.push(action.payload);
    },
    removePurchasedCar(state, action) {
      const carIndex = state.purchasedCars.findIndex(
        car => car.id === action.payload,
      );
      if (carIndex !== -1) {
        state.purchasedCars.splice(carIndex, 1);
      }
    },
  },
});

export const {
  setUserTickets,
  loginSuccess,
  logoutSuccess,
  addPurchasedHotel,
  removePurchasedHotel,
  addPurchasedFlight,
  removePurchasedFlight,
  addPurchasedCar,
  removePurchasedCar,
} = authSlice.actions;
export default authSlice.reducer;