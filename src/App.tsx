import { isEqual } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import {
  from,
  fromEvent,
  interval,
  Observable,
  of,
  Subject,
  Subscription,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { bufferCount, catchError, map, switchMap, take } from "rxjs/operators";
function App() {
  const rxEvent$ = useRef<Observable<MouseEvent>>();
  const rxArray$ = useRef<Observable<number>>();
  const rxInterval$ = useRef<Observable<number>>();
  const rxFetch$ =
    useRef<Observable<number | { error: boolean; message: any }>>();

  const subscribtion = useRef<Subscription>();
  const subject = useRef<Subject<unknown>>();
  useEffect(() => {
    rxFetch$.current = fromFetch(
      "https://api.github.com/users?per_page=5"
    ).pipe(
      switchMap((response) => {
        if (response.ok) {
          // OK return data
          return response.json();
        } else {
          // Server is returning a status requiring the client to try something else.
          return of({ error: true, message: `Error ${response.status}` });
        }
      }),
      catchError((err) => {
        // Network or other error, handle appropriately
        console.error(err);
        return of({ error: true, message: err.message });
      })
    );
    subject.current = new Subject();
    rxFetch$.current.subscribe(subject.current);
    subject.current.subscribe({
      next: (result) => console.log(result),
      complete: () => console.log("Adone"),
    });
    subject.current.subscribe({
      next: (result) => console.log(result),
      complete: () => console.log("Bdone"),
    });
    // rxFromEvent();
  }, []);
  const rxFromEvent = () => {
    rxEvent$.current = fromEvent<MouseEvent>(document, "click").pipe(take(2));
    const subject = new Subject();
    subject.subscribe((e) => console.log("1", e));
    subject.subscribe((e) => console.log("2", e));
    rxEvent$.current.subscribe(subject);
  };
  const noSubject = () => {
    rxEvent$.current = fromEvent<MouseEvent>(document, "click").pipe(take(2));
    rxEvent$.current.subscribe((e) => console.log("1", e));
    rxEvent$.current.subscribe((e) => console.log("2", e));
  };
  const rxFromArray = () => {
    rxArray$.current = from([1, 2, 4, 5, 6, 7, 8, 9]).pipe(take(2));
    const subject = new Subject();
    subject.subscribe((e) => console.log("sub_A", e));
    subject.subscribe((e) => console.log("sub_B", e));
    rxArray$.current.subscribe(subject);

    rxArray$.current.subscribe((e) => console.log("obs_A", e));
    rxArray$.current.subscribe((e) => console.log("obs_B", e));
  };
  const rxFromeInterval = () => {
    rxInterval$.current = interval(500).pipe(take(5));
    const subject = new Subject();
    rxInterval$.current.subscribe(subject);

    subject.subscribe((e) => console.log("sub_A", e));
    setTimeout(() => {
      subject.subscribe((e) => console.log("sub_B", e));
    }, 1000);
    // rxInterval$.current.subscribe((e) => console.log("obs_A", e));
    // setTimeout(() => {
    //   rxInterval$.current?.subscribe((e) => console.log("obs_B", e));
    // }, 500);
  };
  const next = () => {};
  const comboSub = useRef<Subscription>();
  const [comboTime, setComboTime] = useState<number>(20000);
  const [keys, setAllKeys] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<
    { grade: number; isBetter: boolean }[]
  >([]);
  const setKeys = (key: string) => {
    setAllKeys((keys) => [...keys, key]);
  };
  useEffect(() => {
    fromEvent<KeyboardEvent>(document, "keyup")
      .pipe(map((e) => e.code))
      .subscribe(setKeys);
  }, []);
  useEffect(() => {
    comboSub.current = fromEvent<KeyboardEvent>(document, "keyup")
      .pipe(
        map((e) => ({ key: e.code, time: Date.now() })),
        bufferCount(12, 1)
      )
      .subscribe((keys) => {
        const time = keys[keys.length - 1].time - keys[0].time;
        if (
          isEqual(
            code,
            keys.map((item) => item.key)
          )
        ) {
          if (time < comboTime) {
            setHistory((his) => [{ grade: time, isBetter: true }, ...his]);
            setMessage(`${time / 1000}S,great,can u faster?`);
            setComboTime(time);
          } else {
            setHistory((his) => [{ grade: time, isBetter: false }, ...his]);

            setMessage(`${time / 1000}S,it's too slow!`);
          }
        }
      });
    return () => {
      comboSub.current?.unsubscribe();
    };
  }, [comboTime]);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        flexDirection: "row",
        display: "flex",
      }}
    >
      <div style={{ flex: 1 }}>
        just for test
        <h1>Type as fast as you can:↑↑↓↓←→←→BABA</h1>
        <h1 style={{ display: "inline" }}>input: </h1>
        {keys.slice(-12).map((item, index) => (
          <KeysImage key={index}>{item}</KeysImage>
        ))}
        <br />
        <h1>{message}</h1>
      </div>
      <div
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "scroll",
        }}
      >
        <table style={{ border: "1px solid #000" }}>
          <tr>
            <th>grade</th>
          </tr>
          {history.map((item, index) => (
            <tr key={index}>
              <td style={{ color: item.isBetter ? "red" : "#000" }}>
                {item.grade / 1000}s
              </td>
            </tr>
          ))}
        </table>
      </div>

      {/* <button onClick={rxFromEvent}>rxEvent</button>
      <button
        onClick={() => {
          subscribtion.current?.unsubscribe();
        }}
      >
        unsubcribe
      </button>
      <button onClick={rxFromArray}>rxFromArray</button>
      <button onClick={rxFromeInterval}>rxFromeInterval</button>

      <button
        onClick={() => {
          rxArray$.current?.forEach((item) => console.log(item));
        }}
      >
        rxFromArray
      </button>
      <button
        onClick={() => {
          subject.current?.subscribe({
            next: (result) => console.log(result),
            complete: () => console.log("Adone"),
          });
        }}
      >
        rxFromFetch
      </button>
      <button onClick={combo}>combo</button> */}
    </div>
  );
}
const code = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
  "KeyB",
  "KeyA",
];
const KeysImage = ({ children }: { children: string }) => {
  const keysMapping: { [x: string]: string } = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    KeyB: "B",
    KeyA: "A",
  };
  return (
    <h1 style={{ display: "inline-block" }}>{keysMapping[children] || "X"}</h1>
  );
};

export default App;
