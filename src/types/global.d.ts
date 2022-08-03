declare module NodeJS  {

  interface Global {
    base_dir : string;
    root_dir : string;
  }
}

interface STCallBack { (error? : Error, result? : any) :void; }
