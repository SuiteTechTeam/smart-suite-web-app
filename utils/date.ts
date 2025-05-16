export function formatDateToPeruTimezone(date: string | Date): string {
	const peruDate = new Date(date).toLocaleString("es-PE", {
		timeZone: "America/Lima",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
	return peruDate;
}
