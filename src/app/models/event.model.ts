export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  image: string;
  organizerName: string;
  ticketTypes: TicketType[];
}
