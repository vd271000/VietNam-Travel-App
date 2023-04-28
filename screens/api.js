import axios from 'axios';
import {RAPIDAPI_KEY} from '../utilies/Validations';
import {Alert} from 'react-native';

const RAPIDAPI_HOST = 'tripadvisor16.p.rapidapi.com';
const SKY_HOST50 = 'skyscanner50.p.rapidapi.com';

// Flight
export const fetchFlights = async (
  origin,
  destination,
  date,
  returnDate,
  adults = '1',
  children = '0',
  cabinClass = '',
  filter = '',
) => {
  try {
    const response = await axios.get(
      'https://skyscanner50.p.rapidapi.com/api/v1/searchFlights',
      {
        headers: {
          'X-RapidAPI-Host': SKY_HOST50,
          'X-RapidAPI-Key': RAPIDAPI_KEY,
        },
        params: {
          origin: origin,
          destination: destination,
          date: date,
          returnDate: returnDate,
          adults: adults,
          children: children,
          cabinClass: cabinClass,
          filter: filter,
          currency: 'USD',
          countryCode: 'VN',
          market: 'en-US',
        },
      },
    );

    if (!response || !response.data || !response.data.data) {
      console.error(
        'Error finding flight: Invalid response',
        response ? response.data : 'No response',
      );
      return [];
    }
    const flights = response.data.data.map(flight => {
      const firstLeg = flight.legs[0];
      const secondLeg = flight.legs[1];
      const carriers = firstLeg.carriers;
      const durationInHours = Math.floor(firstLeg.duration / 60);
      const durationInMinutes = firstLeg.duration % 60;
      return {
        id: flight.id,
        price: {
          amount: flight.price.amount,
        },
        legs: [
          {
            origin: {
              name: firstLeg.origin.name,
              displayCode: firstLeg.origin.display_code,
            },
            destination: {
              name: firstLeg.destination.name,
              displayCode: firstLeg.destination.display_code,
            },
            date: firstLeg.departure.split('T')[0],
            departure: firstLeg.departure,
            arrival: firstLeg.arrival,
            duration: {hours: durationInHours, minutes: durationInMinutes},
            stopCount: firstLeg.stop_count,
          },
          {
            origin: {
              name: secondLeg.origin.name,
              displayCode: secondLeg.origin.display_code,
            },
            destination: {
              name: secondLeg.destination.name,
              displayCode: secondLeg.destination.display_code,
            },
            date: secondLeg.departure.split('T')[0],
            departure: secondLeg.departure,
            arrival: secondLeg.arrival,
            duration: {hours: durationInHours, minutes: durationInMinutes},
            stopCount: secondLeg.stop_count,
          },
        ],
        carriers: carriers.map(carrier => ({
          name: carrier.name,
        })),
      };
    });
    return flights;
  } catch (error) {
    console.error('Lỗi khi tìm chuyến bay:', error);
    return [];
  }
};

// FlightList
export const fetchFlightDetails = async (itineraryId, legs, adults) => {
  try {
    const response = await axios.get(
      'https://skyscanner50.p.rapidapi.com/api/v1/getFlightDetails',
      {
        headers: {
          'X-RapidAPI-Host': SKY_HOST50,
          'X-RapidAPI-Key': RAPIDAPI_KEY,
        },
        params: {
          itineraryId: itineraryId,
          legs: JSON.stringify(legs),
          adults: adults,
          currency: 'USD',
          countryCode: 'VN',
          market: 'en-US',
        },
      },
    );
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error finding flight details:', error);
    return null;
  }
};

//Restaurants
export const fetchRestaurants = async (
  location_id,
  offset = 0,
  search = '',
) => {
  try {
    const limit = 30;
    const response = await axios.get(
      'https://travel-advisor.p.rapidapi.com/restaurants/list',
      {
        headers: {
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
        },
        params: {
          location_id: location_id,
          currency: 'USD',
          lunit: 'km',
          lang: 'en_US',
          limit: limit,
          offset: offset,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
};

// Hotels
export const fetchHotels = async (
  entityId,
  checkIn,
  checkOut,
  adults = '1',
  children = '0',
  childrenAges = '',
  waitTime = '2000',
  currency = 'USD',
  countryCode = 'VN',
  market = 'en-US',
  price,
  minPrice,
  maxPrice,
  stars,
  mealPlan,
  rating,
  guestType,
  chain,
  cancellation,
  amenities,
  propertyType,
  discounts,
) => {
  const params = {
    entityId,
    checkin: checkIn.toISOString().slice(0, 10),
    checkout: checkOut.toISOString().slice(0, 10),
    adults,
    children,
    childrenAges,
    waitTime,
    currency,
    countryCode,
    market,
    price,
    minPrice,
    maxPrice,
    stars,
    'mealPlan[0]': mealPlan,
    'rating[0]': rating,
    'guestType[0]': guestType,
    'chain[0]': chain,
    'cancellation[0]': cancellation,
    'amenities[0]': amenities,
    'propertyType[0]': propertyType,
    'discounts[0]': discounts,
  };
  const options = {
    method: 'GET',
    url: 'https://skyscanner50.p.rapidapi.com/api/v1/searchHotel',
    params,
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': SKY_HOST50,
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data && response.data.data && response.data.data.hotels) {
      return response.data.data.hotels.map(hotel => ({
        hotelId: hotel.hotelId,
        name: hotel.name,
        distance: hotel.distance,
        price: hotel.price,
        priceDescription: hotel.priceDescription,
        stars: hotel.stars,
        reviewSummary: hotel.reviewSummary,
        images: hotel.heroImage,
        rating1: hotel.rating ? hotel.rating.description : null,
        rating2: hotel.rating ? hotel.rating.count : null,
        rating3: hotel.rating ? hotel.rating.value : null,
        TotalPrice: hotel.rawPrice,
        rateFeatures: hotel.rateFeatures,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 504) {
      Alert.alert('Overload', 'Please try again');
    }
  }
};

//HotelDetails
export const fetchHotelDetail = async hotelId => {
  try {
    const response = await axios.get(
      'https://skyscanner50.p.rapidapi.com/api/v1/getHotelDetails',
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': SKY_HOST50,
        },
        params: {
          hotelId: hotelId,
          currency: 'USD',
          countryCode: 'VN',
          market: 'en-US',
        },
      },
    );

    if (!response || !response.data || !response.data.data) {
      console.error(
        'Error finding hotel details: Invalid response',
        response ? response.data : 'No response',
      );
      return null;
    }

    const data = response.data.data;
    const hotelDetails = {
      hotelName: data.general.name,
      address: data.location.shortAddress,
      latitude: data.location.coordinates.latitude,
      longitude: data.location.coordinates.longitude,
      starRating: data.general.stars,
      description: data.goodToKnow.description.content,
      amenities: data.amenities,
      imageUrls: data.gallery.images.map(image => image.dynamic),
      reviews: data.reviews,
      checkinTitle: data.goodToKnow.checkinTime.title,
      checkinTime: data.goodToKnow.checkinTime.time,
      checkoutTitle: data.goodToKnow.checkoutTime.title,
      checkoutTime: data.goodToKnow.checkoutTime.time,
    };

    hotelDetails.amenitiesV2 = data.amenities.contentV2
      ? data.amenities.contentV2.map(category => ({
          category: category.category,
          items: category.items.map(item => ({
            id: item.id,
            description: item.description,
            icon: item.icon,
          })),
        }))
      : 'No amenities';
    return hotelDetails;
  } catch (error) {
    console.error('Error finding hotel details:', error);
    if (error.response && error.response.status === 504) {
      Alert.alert('Overload', 'Please try again');
    }
    return null;
  }
};

// Destinations
export const fetchDestination = async (location_id, offset = 0) => {
  try {
    const limit = 30;
    const response = await axios.get(
      'https://travel-advisor.p.rapidapi.com/attractions/list',
      {
        headers: {
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
        },
        params: {
          location_id: location_id,
          currency: 'USD',
          lang: 'en_US',
          lunit: 'km',
          sort: 'recommended',
          limit: limit,
          offset: offset,
        },
      },
    );
    console.log(response.data.data);

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
        .map(item => {
          if (
            item &&
            item.photo &&
            item.photo.images &&
            item.photo.images.large &&
            item.hours &&
            item.hours.week_ranges
          ) {
            return {
              name: item.name,
              url: item.photo.images.large.url,
              location_id: item.location_id,
              description: item.description,
              address: item.address,
              num_reviews: item.num_reviews,
              rating: item.rating,
              hours: item.hours.week_ranges,
              open_now_text: item.open_now_text,
              ranking: item.ranking,
              fee: item.fee,
            };
          } else {
            return null;
          }
        })
        .filter(item => item !== null);
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Car
export const fetchCars = async (
  pickUpEntityId,
  dropOffEntityId,
  pickUpDate,
  dropOffDate,
  pickUpTime,
  dropOffTime,
  driverAge,
) => {
  const params = {
    pickUpEntityId,
    dropOffEntityId,
    pickUpDate,
    dropOffDate,
    pickUpTime,
    dropOffTime,
    currency: 'USD',
  };

  if (driverAge) {
    params.driverAge = driverAge;
  }

  const options = {
    method: 'GET',
    url: 'https://skyscanner50.p.rapidapi.com/api/v1/searchCars',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': SKY_HOST50,
    },
    params,
  };

  try {
    const response = await axios.request(options);
    const {data} = response;

    if (
      !data ||
      !data.data.quotes ||
      !data.data.groups ||
      !data.data.providers
    ) {
      return {
        error: 'Cannot find data for quotes, groups or providers.',
      };
    }

    const quotes =
      data?.data?.quotes &&
      Array.isArray(data.data.quotes) &&
      data.data.quotes.length > 0
        ? data.data.quotes.map((quote, index) => ({
            id: index,
            ...quote,
          }))
        : [];

    const providers =
      data?.data?.providers &&
      typeof data.data.providers === 'object' &&
      Object.keys(data.data.providers).length > 0
        ? Object.keys(data.data.providers).map(key => ({
            id: key,
            name: key,
            ...data.data.providers[key],
          }))
        : [];

    const groups =
      data?.data?.groups &&
      typeof data.data.groups === 'object' &&
      Object.keys(data.data.groups).length > 0
        ? Object.keys(data.data.groups).map(key => ({
            id: key,
            ...data.data.groups[key],
          }))
        : [];

    return {quotes, groups, providers};
  } catch (error) {
    console.error(error);
    return null;
  }
};
