//yarn add moment

import { DateTime } from "."
import moment from "moment"
export const convertDateTimeToString = (dateTime) =>{
    return moment(dateTime).format('DD-MM-YYYY')
}