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
  imageAuthor?: string;
  imageAuthorUrl?: string;
  imageSourceUrl?: string;
  organizerName: string;
  ticketTypes: TicketType[];
}
