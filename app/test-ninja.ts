import { injectable, inject, Container } from "inversify";
import "reflect-metadata";

export interface Warrior {
    fight(): string;
    sneak(): string;
}

export interface Weapon {
    hit(): string;
}

export interface ThrowableWeapon {
    throw(): string;
}

@injectable()
export class Smoothie {
    public drink() {
        return "slurp!";
    }
}

@injectable()
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

@injectable()
class Shuriken implements ThrowableWeapon {
    public throw() {
        return "hit!";
    }
}

@injectable()
class Ninja implements Warrior {

    @inject(Smoothie)
    private smoothie: Smoothie;

    public random: number;

    public constructor(
        private katana: Katana,
        private shuriken: Shuriken
    ) {
        this.random = Math.floor(Math.random() * 1000);
    }

    public fight() { return this.katana.hit(); }
    public sneak() { return this.shuriken.throw(); }
    public drinkSmoothie() { return this.smoothie.drink(); }

}

export { Ninja, Katana, Shuriken };


const myContainer = new Container();

function bindContainer(c: Container) {
    myContainer.bind<Smoothie>(Smoothie).to(Smoothie);
    myContainer.bind<Katana>(Katana).to(Katana);
    myContainer.bind<Shuriken>(Shuriken).to(Shuriken);
    myContainer.bind<Ninja>(Ninja).to(Ninja).inSingletonScope();
}

bindContainer(myContainer);

export { myContainer, bindContainer };
