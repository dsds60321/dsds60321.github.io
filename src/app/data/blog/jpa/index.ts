import hibernate from "@/app/data/blog/jpa/hibernate";
import jpaMapping from "@/app/data/blog/jpa/jpaMapping";
import jpaSummary2 from "@/app/data/blog/jpa/jpaSummary2";
import persistenceContext from "@/app/data/blog/jpa/persistence-context";

export const jpaPosts = [hibernate,jpaMapping,jpaSummary2,persistenceContext];
