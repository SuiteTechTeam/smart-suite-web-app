export class Room {

    constructor(id, name, description, price, worker, client,totalBeds, totalBathrooms, totalTelevision, isBusy) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.worker = worker;
        this.client = client;
        this.totalBeds = totalBeds;
        this.totalBathrooms = totalBathrooms;
        this.totalTelevision = totalTelevision;
        this.isBusy = isBusy;

        if (this.isBusy === true){
            this.status = 'busy';
        }
        else if (this.isBusy === false){
            this.status = 'not busy';
        }
    }

    static fromDisplayableRoom(displayableRoom) {
        if (displayableRoom.status.value === 'busy'){
            displayableRoom.isBusy = true;
        }
        else if (displayableRoom.status.value === 'not busy'){
            displayableRoom.isBusy = false;
        }

        return new Room(
            displayableRoom.id,
            displayableRoom.name,
            displayableRoom.description,
            displayableRoom.price,
            displayableRoom.worker,
            displayableRoom.client,
            displayableRoom.totalBeds,
            displayableRoom.totalBathrooms,
            displayableRoom.totalTelevision,
            displayableRoom.isBusy);
    }

    static toDisplayableRoom(room) {

        let temp = '';

        if (room.isBusy === true){
            temp = 'busy';
        }
        else if (room.isBusy === false){
            temp = 'not busy';
        }

        return {
            id: room.id,
            name: room.name,
            description: room.description,
            price: room.price,
            worker: room.worker,
            client: room.client,
            totalBeds: room.totalBeds,
            totalBathrooms: room.totalBathrooms,
            totalTelevision: room.totalTelevision,
            status: temp
        };
    }
}