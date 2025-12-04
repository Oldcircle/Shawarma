import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Customer, 
  IngredientType, 
  GameState, 
  DayStats 
} from './types';
import { 
  INGREDIENT_PRICES, 
  INGREDIENT_COLORS,
  BASE_PATIENCE
} from './constants';
import { IngredientButton } from './components/IngredientButton';
import { CustomerView } from './components/CustomerView';
import { generateDailyReview } from './services/geminiService';
import { Play, RotateCcw, Coins, Clock, ChefHat, Trash2, UtensilsCrossed, Star } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [day, setDay] = useState(1);
  const [money, setMoney] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); 
  
  const [currentWrap, setCurrentWrap] = useState<IngredientType[]>([]);
  const [meatStock, setMeatStock] = useState(0); 
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [scoreAnimation, setScoreAnimation] = useState<{amt: number, id: number} | null>(null);

  const statsRef = useRef<DayStats>({
    dayNumber: 1, servedCount: 0, failedCount: 0, moneyEarned: 0, tips: 0, perfectOrders: 0
  });
  const [review, setReview] = useState<string>("");
  const [loadingReview, setLoadingReview] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const lastCustomerSpawn = useRef<number>(0);

  // --- Logic Helpers ---

  const generateOrder = useCallback((difficulty: number): IngredientType[] => {
    const order: IngredientType[] = [IngredientType.PITA, IngredientType.MEAT];
    const extras = [IngredientType.CUCUMBER, IngredientType.FRIES, IngredientType.CHEESE];
    const numExtras = Math.floor(Math.random() * (difficulty > 3 ? 3 : 2)) + 1;
    
    for(let i=0; i<numExtras; i++) {
      const extra = extras[Math.floor(Math.random() * extras.length)];
      if(!order.includes(extra)) order.push(extra);
    }
    order.push(IngredientType.SAUCE);
    return order;
  }, []);

  const spawnCustomer = useCallback(() => {
    const id = Date.now().toString();
    const newCustomer: Customer = {
      id,
      patience: BASE_PATIENCE,
      maxPatience: BASE_PATIENCE,
      order: generateOrder(day),
      avatarId: Math.floor(Math.random() * 5)
    };
    setCustomers(prev => [...prev, newCustomer]);
  }, [day, generateOrder]);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setCustomers([]);
    setCurrentWrap([]);
    setMeatStock(0);
    setTimeLeft(60);
    statsRef.current = {
      dayNumber: day, servedCount: 0, failedCount: 0, moneyEarned: 0, tips: 0, perfectOrders: 0
    };
    lastCustomerSpawn.current = Date.now();
    spawnCustomer();
  };

  const cutMeat = () => {
    if (meatStock < 5) {
      setMeatStock(prev => prev + 1);
    }
  };

  const addToWrap = (type: IngredientType) => {
    if (type === IngredientType.MEAT) {
      if (meatStock > 0) {
        setMeatStock(prev => prev - 1);
        setCurrentWrap(prev => [...prev, type]);
      }
    } else {
      setCurrentWrap(prev => [...prev, type]);
    }
  };

  const trashWrap = () => {
    setCurrentWrap([]);
  };

  const serveWrap = () => {
    if (customers.length === 0 || currentWrap.length === 0) return;
    const targetCustomer = customers[0];
    
    const isSuccess = targetCustomer.order.every(reqItem => currentWrap.includes(reqItem)) 
                      && currentWrap.every(wrapItem => targetCustomer.order.includes(wrapItem));

    if (isSuccess) {
      let earnings = 0;
      targetCustomer.order.forEach(ing => earnings += INGREDIENT_PRICES[ing]);
      const tip = Math.floor(targetCustomer.patience / 10);
      earnings += tip;

      setMoney(prev => prev + earnings);
      statsRef.current.servedCount++;
      statsRef.current.moneyEarned += earnings;
      statsRef.current.tips += tip;
      if (targetCustomer.patience > 80) statsRef.current.perfectOrders++;

      setScoreAnimation({ amt: earnings, id: Date.now() });
      setTimeout(() => setScoreAnimation(null), 1000);
    } else {
      statsRef.current.failedCount++;
    }

    setCustomers(prev => prev.slice(1));
    setCurrentWrap([]);
  };

  // --- Game Loop ---
  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
      if (gameLoopRef.current) {
        window.cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = now - lastTime;
      
      if (dt >= 100) { 
        lastTime = now;
        setCustomers(prev => {
          const nextCustomers = prev.map(c => ({
            ...c,
            patience: c.patience - (0.5 + (day * 0.1))
          })).filter(c => {
            if (c.patience <= 0) {
              statsRef.current.failedCount++;
              return false;
            }
            return true;
          });
          return nextCustomers;
        });

        if (now - lastCustomerSpawn.current > Math.max(2000, 5000 - (day * 500))) {
          if (customers.length < 4) { 
             spawnCustomer();
             lastCustomerSpawn.current = now;
          } else {
            lastCustomerSpawn.current = now - 2000;
          }
        }
      }
      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => { if(gameLoopRef.current) window.cancelAnimationFrame(gameLoopRef.current); }
  }, [gameState, day, customers.length, spawnCustomer]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState(GameState.DAY_END);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.DAY_END) {
      const fetchReview = async () => {
        setLoadingReview(true);
        const reviewText = await generateDailyReview(statsRef.current);
        setReview(reviewText);
        setLoadingReview(false);
      };
      fetchReview();
    }
  }, [gameState]);

  // --- Visual Components ---

  const renderIngredientStack = () => {
    return (
      <div className="flex flex-col-reverse items-center justify-start h-full w-full relative pt-6">
        {currentWrap.map((type, idx) => (
          <div 
            key={idx}
            className={`w-24 h-6 rounded-md border border-black/10 shadow-sm z-10 ${INGREDIENT_COLORS[type]} transition-all animate-bounce-short`}
            style={{ 
              transform: `translateY(${idx * 6}px) rotate(${Math.sin(idx * 132)*2}deg)`,
              marginBottom: '-16px',
            }}
          />
        ))}
        {currentWrap.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center text-amber-800/30 text-sm font-bold tracking-wider uppercase text-center">
             Place<br/>Ingredients
           </div>
        )}
      </div>
    );
  };

  if (gameState === GameState.MENU) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden bg-gradient-to-br from-orange-100 to-yellow-50 rounded-3xl border-8 border-white shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-orange-400 opacity-10 rounded-b-[100%]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400 opacity-20 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-500">
          <div className="bg-white p-6 rounded-full shadow-xl mb-6 ring-8 ring-orange-100">
            <ChefHat size={80} className="text-orange-500" />
          </div>
          
          <h1 className="title-font text-5xl md:text-6xl font-black text-orange-900 mb-2 drop-shadow-sm text-center">
            Tasty<br/><span className="text-orange-600">Shawarma</span>
          </h1>
          <p className="text-orange-800/60 font-bold mb-10 tracking-wider">
            STREET FOOD LEGEND
          </p>
          
          <button 
            onClick={() => { setDay(1); setMoney(0); startGame(); }}
            className="group relative bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-[0_6px_0_#15803d] active:shadow-none active:translate-y-[6px] transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play fill="currentColor" /> OPEN SHOP
            </span>
            {/* Button shine */}
            <div className="absolute top-0 -left-10 w-10 h-full bg-white/30 skew-x-12 group-hover:translate-x-60 transition-transform duration-700"></div>
          </button>
          
          <div className="mt-8 flex gap-4 text-xs font-bold text-orange-800/40">
             <span>• FRESH INGREDIENTS</span>
             <span>• HAPPY CUSTOMERS</span>
             <span>• BIG TIPS</span>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === GameState.DAY_END) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500">
          {/* Receipt Header */}
          <div className="bg-orange-500 p-6 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_2px,transparent_2px)] bg-[length:10px_10px]"></div>
             <h2 className="text-3xl font-black title-font relative z-10">Daily Report</h2>
             <p className="text-orange-100 font-bold relative z-10">Day {day} Complete!</p>
          </div>
          
          {/* Zigzag Paper Edge */}
          <div className="h-4 bg-orange-500 relative">
             <div className="absolute top-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0 100%, 2.5% 0, 5% 100%, 7.5% 0, 10% 100%, 12.5% 0, 15% 100%, 17.5% 0, 20% 100%, 22.5% 0, 25% 100%, 27.5% 0, 30% 100%, 32.5% 0, 35% 100%, 37.5% 0, 40% 100%, 42.5% 0, 45% 100%, 47.5% 0, 50% 100%, 52.5% 0, 55% 100%, 57.5% 0, 60% 100%, 62.5% 0, 65% 100%, 67.5% 0, 70% 100%, 72.5% 0, 75% 100%, 77.5% 0, 80% 100%, 82.5% 0, 85% 100%, 87.5% 0, 90% 100%, 92.5% 0, 95% 100%, 97.5% 0, 100% 100%)' }}></div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between items-end border-b-2 border-dashed border-gray-200 pb-4">
              <span className="text-gray-500 font-bold">Total Earnings</span>
              <span className="text-3xl font-black text-green-600">${statsRef.current.moneyEarned}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Served</span>
                <span className="font-bold text-gray-800">{statsRef.current.servedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failed</span>
                <span className="font-bold text-red-500">{statsRef.current.failedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Perfect</span>
                <span className="font-bold text-amber-500">{statsRef.current.perfectOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tips</span>
                <span className="font-bold text-green-500">${statsRef.current.tips}</span>
              </div>
            </div>

            {/* Review Section */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative mt-4">
               <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-orange-500 shadow-sm rounded-full flex items-center gap-1">
                 <Star size={12} fill="currentColor" /> FOOD BLOGGER SAYS
               </div>
               <p className="text-gray-600 text-sm leading-relaxed italic min-h-[60px] flex items-center justify-center text-center">
                 {loadingReview ? (
                   <span className="animate-pulse text-gray-400">Typing review...</span>
                 ) : (
                   `"${review}"`
                 )}
               </p>
            </div>

            <button 
              onClick={() => { setDay(d => d + 1); startGame(); }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              Start Next Day
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-[700px] md:h-[800px] flex flex-col bg-white rounded-3xl border-8 border-white shadow-2xl overflow-hidden relative">
      
      {/* HUD Header */}
      <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
           <div className="bg-white/90 backdrop-blur text-green-700 px-4 py-2 rounded-full border-2 border-green-100 shadow-lg flex items-center gap-2">
             <Coins size={20} className="fill-green-100" />
             <span className="font-black text-xl">${money}</span>
           </div>
           <div className="bg-white/90 backdrop-blur text-orange-800 px-3 py-1 rounded-full border-2 border-orange-100 shadow-lg inline-flex items-center gap-1 self-start">
             <span className="text-xs font-bold uppercase">Day {day}</span>
           </div>
        </div>
        
        <div className={`
          bg-white/90 backdrop-blur px-4 py-2 rounded-full border-2 shadow-lg flex items-center gap-2
          ${timeLeft < 10 ? 'border-red-200 text-red-600 animate-pulse' : 'border-blue-200 text-blue-600'}
        `}>
          <Clock size={20} />
          <span className="font-black text-xl tabular-nums">{timeLeft}s</span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Top: Street View with Awning */}
        <div className="h-[45%] relative bg-sky-200 overflow-hidden flex flex-col">
           {/* Clouds / Sun */}
           <div className="absolute top-4 right-10 w-16 h-16 bg-yellow-300 rounded-full blur-xl opacity-60"></div>
           <div className="absolute top-10 left-20 w-24 h-8 bg-white/40 rounded-full blur-sm"></div>

           {/* Cityscape Silhouette */}
           <div className="absolute bottom-0 w-full h-1/3 bg-sky-300/50" style={{ clipPath: 'polygon(0% 100%, 0% 20%, 10% 20%, 10% 0%, 20% 0%, 20% 30%, 30% 30%, 30% 10%, 40% 10%, 40% 40%, 50% 40%, 50% 10%, 60% 10%, 60% 50%, 70% 50%, 70% 20%, 80% 20%, 80% 0%, 90% 0%, 90% 30%, 100% 30%, 100% 100%)' }}></div>
           
           {/* Awning */}
           <div className="absolute top-0 left-0 w-full h-12 awning-stripes shadow-md z-30 relative">
              <div className="absolute -bottom-2 w-full h-4 bg-transparent bg-[radial-gradient(circle,transparent_50%,#ef4444_50%)] bg-[length:20px_20px] bg-[position:0_-10px] transform rotate-180"></div>
           </div>
           
           {/* Shop Glass Reflection */}
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-20"></div>

           {/* Customers Container */}
           <div className="flex-1 flex items-end justify-around px-2 pb-2 z-10 relative">
             {customers.map((c) => (
               <CustomerView key={c.id} customer={c} />
             ))}
             {customers.length === 0 && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/60 px-4 py-2 rounded-full text-sky-700 font-bold text-sm">
                 Waiting for hungry customers...
               </div>
             )}
           </div>
        </div>

        {/* Middle: Wooden Counter */}
        <div className="h-4 bg-[#b45309] border-t border-[#78350f] shadow-lg relative z-20"></div>
        
        {/* Bottom: Kitchen Controls */}
        <div className="flex-1 bg-[#fff7ed] flex flex-col relative z-10">
            {/* Tiled Wall Background */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

            {/* Prep Station */}
            <div className="flex justify-between items-stretch gap-2 p-4 h-[200px] relative">
              
              {/* MEAT SPIT */}
              <div 
                className="w-24 relative cursor-pointer group select-none flex flex-col items-center justify-end pb-2"
                onClick={cutMeat}
              >
                {/* Spit Machine */}
                <div className="absolute bottom-0 w-full h-[90%] bg-gray-200 rounded-t-xl border-x-2 border-t-2 border-gray-300 shadow-inner flex justify-center">
                    <div className="w-2 h-full bg-gray-400 absolute z-0 top-2"></div>
                </div>

                {/* The Meat */}
                <div className="relative z-10 w-16 h-32 bg-[#8B4513] rounded-full border-y-4 border-[#5D2906] flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer hover:brightness-110">
                   {/* Meat Texture */}
                   <div className="w-full h-full rounded-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#3e1b04_6px)] animate-spin-slow"></div>
                   {/* Shine */}
                   <div className="absolute top-4 right-2 w-2 h-20 bg-white/20 rounded-full blur-sm"></div>
                </div>

                <div className="absolute -top-2 bg-white border border-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full shadow-sm z-20 font-bold">
                  TAP MEAT
                </div>
              </div>

              {/* ASSEMBLY BOARD */}
              <div className="flex-1 bg-[#eab308] rounded-xl border-b-4 border-[#ca8a04] shadow-md relative flex items-center justify-center mx-2 group">
                 {/* Wood Texture */}
                 <div className="absolute inset-0 bg-[#fde047] opacity-20 rounded-xl" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ca8a04 10px, #ca8a04 11px)' }}></div>
                 
                 {/* Paper Wrapper */}
                 <div className="relative w-[160px] h-[160px] bg-white shadow-sm rotate-1 flex items-center justify-center transition-transform group-hover:scale-105">
                    {/* Greaseproof paper texture */}
                    <div className="absolute inset-0 opacity-5 bg-black"></div>
                    {renderIngredientStack()}
                 </div>

                 {/* Score Popup */}
                 {scoreAnimation && (
                    <div className="absolute top-10 right-10 text-4xl font-black text-green-500 drop-shadow-md animate-bounce z-50">
                      +${scoreAnimation.amt}
                    </div>
                 )}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-2 w-16 justify-center">
                 <button 
                  onClick={serveWrap}
                  disabled={currentWrap.length === 0}
                  className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-white shadow-lg shadow-green-200 active:shadow-none active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-white"
                  title="Serve Order"
                 >
                   <UtensilsCrossed size={24} />
                 </button>
                 <button 
                  onClick={trashWrap}
                  disabled={currentWrap.length === 0}
                  className="h-12 w-12 rounded-full bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-500 mx-auto active:scale-95 transition-all flex items-center justify-center"
                  title="Throw Away"
                 >
                   <Trash2 size={20} />
                 </button>
              </div>

            </div>

            {/* INGREDIENT BINS - Scrollable on mobile if needed, but grid fits well */}
            <div className="flex-1 bg-white border-t border-gray-100 p-4">
               <div className="grid grid-cols-3 gap-3 h-full">
                  <IngredientButton type={IngredientType.PITA} onClick={() => addToWrap(IngredientType.PITA)} />
                  <IngredientButton 
                      type={IngredientType.MEAT} 
                      onClick={() => addToWrap(IngredientType.MEAT)} 
                      count={meatStock}
                      disabled={meatStock === 0}
                  />
                  <IngredientButton type={IngredientType.CUCUMBER} onClick={() => addToWrap(IngredientType.CUCUMBER)} />
                  <IngredientButton type={IngredientType.FRIES} onClick={() => addToWrap(IngredientType.FRIES)} />
                  <IngredientButton type={IngredientType.CHEESE} onClick={() => addToWrap(IngredientType.CHEESE)} />
                  <IngredientButton type={IngredientType.SAUCE} onClick={() => addToWrap(IngredientType.SAUCE)} />
               </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default App;