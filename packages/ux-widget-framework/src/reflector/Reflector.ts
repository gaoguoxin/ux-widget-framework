
/**
 * Base reflector interface, represents a "typespace". 
 * 
 * We separate these out from the TypeDoc-specific impls so that we can eventually build the same model talking directly to TSC / JS parsers and bypass it.
 */
export interface Reflector {

    /**
     * Find classes by name across all modules
     */
    findClassesByName(className: string): Array<ClassMirror>;

    /** List of the external modules */
    readonly moduleNames: Array<string>;

    /**
     * Reflect on the named module
     * @param moduleName a valid name from the list returned from this.moduleNames
     */
    describeModule(moduleName: string): ModuleMirror;

    /**
     * All modules in this univers
     */
    readonly modules: Array<ModuleMirror>;

    readonly builtinAny: TypeMirror;
    readonly builtinUndefined: TypeMirror;
    readonly builtinVoid: TypeMirror;
    readonly builtinString: TypeMirror;
    readonly builtinNumber: TypeMirror;
    readonly builtinBoolean: TypeMirror;

    isArray(mirror: any): mirror is ArrayMirror;
    isCallable(mirror: any): mirror is CallableMirror;
    isClass(mirror: any): mirror is ClassMirror;
    isEnum(mirror: any): mirror is EnumMirror;
    isExternalTypeReference(mirror: any): mirror is ExternalTypeReference;
    isInterface(mirror: any): mirror is InterfaceMirror;
    isInterfaceLike(mirror: any): mirror is InterfaceLike;
    isInterfaceLiteral(mirror: any): mirror is InterfaceLiteralMirror;
    isIntersection(mirror: any): mirror is IntersectionMirror;
    isModule(mirror: any): mirror is ModuleMirror;
    isNamespace(mirror: any): mirror is NamespaceMirror;
    isObjectLiteral(mirror: any): mirror is ObjectLiteralMirror;
    isProperty(mirror: any): mirror is PropertyMirror;
    isTypeAlias(mirror: any): mirror is TypeAliasMirror;
    isUnion(mirror: any): mirror is UnionMirror;
};

export enum MirrorKind {
    Accessor = 'Accessor',
    Array = 'Array',
    Class = 'Class',
    Constructor = 'Constructor',
    Enum = 'Enum',
    ExternalTypeReference = 'ExternalTypeReference',
    Function = 'Function',
    IndexSignature = 'IndexSignature',
    Interface = 'Interface',
    InterfaceLiteral = 'InterfaceLiteral',
    Intersection = 'Intersection',
    Method = 'Method',
    Module = 'Module',
    Namespace = 'Namespace',
    ObjectLiteral = 'ObjectLiteral',
    Primitive = 'Primitive',
    Property = 'Property',
    StringLiteral = 'StringLiteral',
    TypeAlias = 'TypeAlias',
    TypeOperator = 'TypeOperator',
    TypeParameter = 'TypeParameter',
    Union = 'Union',
    Unknown = 'Unknown',
}

/** 
 * Represents any declaration that can have doc comments. Not just types themselves, but also properties within a class / interface
 */
interface SupportsDocComments {

    /** Has doc comments? */
    readonly hasComment: boolean;

    /** Doc comment heading */
    readonly commentShortText: string;

    /** Doc comment details */
    readonly commentLongText: string;

    // TODO: Tags
}

/**
 * Represents a typedef, might be a Class or Interface, Enum, or just a type alias
 */
export interface TypeMirror {

    readonly mirrorKind: MirrorKind;

    /** Complex types would include classes, interfaces, enums, unions */
    readonly isComplex: boolean;

    /**
     * Is builtin. Could be vm objects (number, string, Date, etc) or things that exist only in the type system like Unions
     */
    readonly isBuiltin: boolean;

    /**
     * Is primitive ( Boolean, Null, Undefined, Number, String, Symbol )
     */
    readonly isPrimitive: boolean;

    /**
     * Name of this type, if it has one.
     */
    readonly name?: string;

    /**
     * A list of any type arguments used in this declaration
     */
    readonly typeArguments: Array<TypeMirror>;
}

export interface ArrayMirror extends TypeMirror {
    mirrorKind: MirrorKind.Array;
}

export interface StringLiteralMirror extends TypeMirror {
    readonly value: string;
}

export type NamespaceMember =
    | CallableMirror
    | ClassMirror
    | EnumMirror
    | InterfaceMirror
    | NamespaceMirror
    | ObjectLiteralMirror
    | PropertyMirror
    | TypeAliasMirror
    ;

export type InterfaceLikeMember =
    | PropertyMirror
    | CallableMirror
    ;

/**
 * Common members shared by external modules (source files) and TS namespaces
 */
interface NamespaceBase {

    readonly mirrorKind: MirrorKind;

    /**
     * The local name of the module / namespace
     */
    readonly name: string;

    /**
     * All child members of this namespace / module
     */
    readonly members: Array<NamespaceMember>;

    /**
     * The child namespaces contained in this namespace / module
     */
    readonly namespaces: Array<NamespaceMirror>;

    /**
     * Properties / variables / consts contained in this namespace / module
     */
    readonly properties: Array<PropertyMirror>;

    /**
     * Interfaces contained in this namespace / module
     */
    readonly interfaces: Array<InterfaceMirror>;

    /**
     * Classes contained in this namespace / module
     */
    readonly classes: Array<ClassMirror>;

    /**
     * Enums contained in this namespace / module
     */
    readonly enums: Array<EnumMirror>;

    /**
     * Type Aliases contained in this namespace / module
     */
    readonly typeAliases: Array<TypeAliasMirror>;

    /**
     * Functions contained in this namespace / module
     */
    readonly functions: Array<CallableMirror>;

    /**
     * Object literals contained in this namespace / module
     */
    readonly objectLiterals: Array<ObjectLiteralMirror>;
}

/**
 * Represents TS namespaces
 */
export interface NamespaceMirror extends NamespaceBase {
    mirrorKind: MirrorKind.Namespace;
}

/**
 * Represents an external module (a TypeScript source file, basically)
 */
export interface ModuleMirror extends NamespaceBase {
    mirrorKind: MirrorKind.Module;

    /**
     * The "original name" of the module, refers to the parsed source file
     */
    readonly originalName: string;
}

/**
 * Represents a type alias
 */
export interface TypeAliasMirror extends TypeMirror, SupportsDocComments {
    mirrorKind: MirrorKind.TypeAlias;

    /**
     * The definition (RHS) of this alias
     */
    readonly targetDefinition: TypeMirror;
}

/**
 * Represents an object literal type
 * 
 * This is a single-instance type, which differentiates it from an interface literal type, which is an anonymous interface.
 */
export interface ObjectLiteralMirror extends TypeMirror {
    mirrorKind: MirrorKind.ObjectLiteral;

    /**
     * All members of this literal
     */
    readonly members: Array<InterfaceLikeMember>;

    /**
     * Properties of this literal
     */
    readonly properties: Array<PropertyMirror>;

    /** 
     * Index Signature, if present
     */
    readonly indexSignature?: IndexSignature;

    /**
     * Methods 
     */
    readonly methods: Array<CallableMirror>;
}

/**
 * Represents an interface/class/literal definition, which has child properties and methods
 */
export interface InterfaceLike extends TypeMirror {

    /**
     * Describe a named property (everything except normal methods and constructor)
     */
    describeProperty(propName: string): PropertyMirror;

    /**
     * Lists child properties. Includes variables, object properties, getters, setters
     */
    readonly propertyNames: Array<string>;

    /**
     * All members of the interface/class
     */
    readonly members: Array<InterfaceLikeMember>;

    /**
     * Properties / variables / consts 
     */
    readonly properties: Array<PropertyMirror>;

    /**
     * Methods 
     */
    readonly methods: Array<CallableMirror>;

    /** 
     * Index Signature, if present
     */
    readonly indexSignature?: IndexSignature;
}

/**
 * Represents a type literal used in-place of a named type
 */
export interface InterfaceLiteralMirror extends InterfaceLike {
    mirrorKind: MirrorKind.InterfaceLiteral;
}

/**
 * Represents a TS interface decl
 */
export interface InterfaceMirror extends InterfaceLike, SupportsDocComments {
    mirrorKind: MirrorKind.Interface;
}

/**
 * Represents a TS class
 */
export interface ClassMirror extends InterfaceLike, SupportsDocComments {
    mirrorKind: MirrorKind.Class;

    readonly isAbstract: boolean;
    readonly constructorMirror?: CallableMirror;
}

/**
 * Represents a property, const, getter/setter definition within an interface, class, interface literal or module
 */
export interface PropertyMirror extends SupportsDocComments {
    mirrorKind: MirrorKind;

    /**
     * Name of this property
     */
    readonly name: string;

    /**
     * Reflect the type of this property
     */
    readonly type: TypeMirror;

    /**
     * Default value - returns a JS expression in string form, or undefined if none exists
     */
    readonly defaultValue?: string;

    readonly readable: boolean;
    readonly writeable: boolean;
    readonly isStatic: boolean;
}

/** 
 * Represents a Union
 */
export interface UnionMirror extends TypeMirror {
    mirrorKind: MirrorKind.Union;

    readonly members: Array<TypeMirror>;
}

/** 
 * Represents a Union
 */
export interface IntersectionMirror extends TypeMirror {
    mirrorKind: MirrorKind.Intersection;

    readonly members: Array<TypeMirror>;
}

/**
 * Represents a callable (function / method / constructor)
 */
export interface CallableMirror extends TypeMirror {
    /**
     * The set of possible signatures for this callable object
     */
    readonly signatures: Array<CallableSignature>;

    readonly isMethod: boolean;
    readonly isConstructor: boolean;

    /**
     * Is a static member on a class?
     * 
     * Meaningless for constructors / functions / methods on literals
     */
    readonly isStatic: boolean;
}

/**
 * Represents a parameter to a function / method / constructor call
 */
export interface Parameter {
    /**
     * Name of parameter, if specified
     */
    readonly name?: string;

    /**
     * Type of the param
     */
    readonly type: TypeMirror;
}

/**
 * A single signature type
 */
export interface CallableSignature extends SupportsDocComments {
    readonly parameters: Array<Parameter>;
    readonly returnType: TypeMirror;
}

/**
 * Represents an Enum type
 */
export interface EnumMirror extends TypeMirror {
    mirrorKind: MirrorKind.Enum;

    members: Array<EnumMember>;
}

/** 
 * An enum member
 */
export interface EnumMember {
    readonly name: string;
    readonly defaultValue: string;
}

/**
 * Represents a named reference to a type external to the source base represented by the Reflector (such as code in node_modules)
 */
export interface ExternalTypeReference extends TypeMirror {
    mirrorKind: MirrorKind.ExternalTypeReference;

    readonly name: string;
}

/**
 * Represents a type param from a surrounding generic definition
 */
export interface TypeParameter extends TypeMirror {
    mirrorKind: MirrorKind.TypeParameter;

    readonly name: string;
}

/**
 * Represents an index signature on an interface
 * 
 * Index signatures take the form of `[k: IndexType]: ValueType` where IndexType is string or number (as of TS3), and ValueType is anything
 */
export interface IndexSignature {
    mirrorKind: MirrorKind.IndexSignature;

    readonly indexType: TypeMirror;
    readonly valueType: TypeMirror;
}