/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export type MedicStruct = {
  addr: PromiseOrValue<string>;
  name: PromiseOrValue<string>;
  url: PromiseOrValue<string>;
};

export type MedicStructOutput = [string, string, string] & {
  addr: string;
  name: string;
  url: string;
};

export interface MedicsBookInterface extends utils.Interface {
  functions: {
    "addMedic(string,string)": FunctionFragment;
    "existMedic(address)": FunctionFragment;
    "getDoctors(uint256,uint256)": FunctionFragment;
    "getDoctorsCount()": FunctionFragment;
    "getMedic(address)": FunctionFragment;
    "initialize()": FunctionFragment;
    "medicsList(uint256)": FunctionFragment;
    "paused()": FunctionFragment;
    "updateMedic(string,string)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addMedic"
      | "existMedic"
      | "getDoctors"
      | "getDoctorsCount"
      | "getMedic"
      | "initialize"
      | "medicsList"
      | "paused"
      | "updateMedic"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addMedic",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "existMedic",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDoctors",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDoctorsCount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMedic",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "medicsList",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "updateMedic",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "addMedic", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "existMedic", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getDoctors", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDoctorsCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getMedic", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "medicsList", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updateMedic",
    data: BytesLike
  ): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "NewMedic(address,string)": EventFragment;
    "Paused(address)": EventFragment;
    "Unpaused(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewMedic"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface NewMedicEventObject {
  addr: string;
  name: string;
}
export type NewMedicEvent = TypedEvent<[string, string], NewMedicEventObject>;

export type NewMedicEventFilter = TypedEventFilter<NewMedicEvent>;

export interface PausedEventObject {
  account: string;
}
export type PausedEvent = TypedEvent<[string], PausedEventObject>;

export type PausedEventFilter = TypedEventFilter<PausedEvent>;

export interface UnpausedEventObject {
  account: string;
}
export type UnpausedEvent = TypedEvent<[string], UnpausedEventObject>;

export type UnpausedEventFilter = TypedEventFilter<UnpausedEvent>;

export interface MedicsBook extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MedicsBookInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    existMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getDoctors(
      page: PromiseOrValue<BigNumberish>,
      size: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getDoctorsCount(overrides?: CallOverrides): Promise<[BigNumber]>;

    getMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[MedicStructOutput]>;

    initialize(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    medicsList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    updateMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addMedic(
    _name: PromiseOrValue<string>,
    _url: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  existMedic(
    _medic: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  getDoctors(
    page: PromiseOrValue<BigNumberish>,
    size: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getDoctorsCount(overrides?: CallOverrides): Promise<BigNumber>;

  getMedic(
    _medic: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<MedicStructOutput>;

  initialize(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  medicsList(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  updateMedic(
    _name: PromiseOrValue<string>,
    _url: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    existMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    getDoctors(
      page: PromiseOrValue<BigNumberish>,
      size: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getDoctorsCount(overrides?: CallOverrides): Promise<BigNumber>;

    getMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<MedicStructOutput>;

    initialize(overrides?: CallOverrides): Promise<void>;

    medicsList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    updateMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "NewMedic(address,string)"(addr?: null, name?: null): NewMedicEventFilter;
    NewMedic(addr?: null, name?: null): NewMedicEventFilter;

    "Paused(address)"(account?: null): PausedEventFilter;
    Paused(account?: null): PausedEventFilter;

    "Unpaused(address)"(account?: null): UnpausedEventFilter;
    Unpaused(account?: null): UnpausedEventFilter;
  };

  estimateGas: {
    addMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    existMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDoctors(
      page: PromiseOrValue<BigNumberish>,
      size: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDoctorsCount(overrides?: CallOverrides): Promise<BigNumber>;

    getMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    medicsList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    updateMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    existMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDoctors(
      page: PromiseOrValue<BigNumberish>,
      size: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDoctorsCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getMedic(
      _medic: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    medicsList(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateMedic(
      _name: PromiseOrValue<string>,
      _url: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
