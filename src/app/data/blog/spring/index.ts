import iocDi from './ioc-di'
import webFlux from "@/app/data/blog/spring/webFlux";
import executorService from "@/app/data/blog/spring/executorService";

export const springPosts = [executorService,iocDi,webFlux];
