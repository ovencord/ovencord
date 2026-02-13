Component Reference\[



](#component-reference)

=============================================



On this page



\[What is a Component](#what-is-a-component)\[Anatomy of a Component](#anatomy-of-a-component)\[Action Row](#action-row)\[Button](#button)\[String Select](#string-select)\[Text Input](#text-input)\[User Select](#user-select)\[Role Select](#role-select)\[Mentionable Select](#mentionable-select)\[Channel Select](#channel-select)\[Section](#section)\[Text Display](#text-display)\[Thumbnail](#thumbnail)\[Media Gallery](#media-gallery)\[File](#file)\[Separator](#separator)\[Container](#container)\[Label](#label)\[File Upload](#file-upload)\[Unfurled Media Item](#unfurled-media-item)\[Legacy Message Component Behavior](#legacy-message-component-behavior)



This document serves as a comprehensive reference for all available components. It covers three main categories:



\*   Layout Components - For organizing and structuring content (Action Rows, Sections, Containers)

\*   Content Components - For displaying static text, images, and files (Text Display, Media Gallery, Thumbnails)

\*   Interactive Components - For user interactions (Buttons, Select Menus, Text Input)



To use these components, you need to send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2) which can be sent on a per-message basis. Once a message has been sent with this flag, it can't be removed from that message. This enables the new components system with the following changes:



\*   The `content` and `embeds` fields will no longer work but you'll be able to use \[Text Display](/developers/docs/components/reference#text-display) and \[Container](/developers/docs/components/reference#container) as replacements

\*   Attachments won't show by default - they must be exposed through components

\*   The `poll` and `stickers` fields are disabled

\*   Messages allow up to 40 total components



\[Legacy component behavior](/developers/docs/components/reference#legacy-message-component-behavior) will continue to work but provide less flexibility and control over the message layout.



For a practical guide on implementing these components, see our \[Using Message Components](/developers/docs/components/using-message-components) and \[Using Modal Components](/developers/docs/components/using-modal-components) documentation.



\* \* \*



What is a Component\[



](#what-is-a-component)

---------------------------------------------



Components allow you to style and structure your messages, modals, and interactions. They are interactive elements that can create rich user experiences in your Discord applications.



Components are a field on the \[message object](/developers/docs/resources/message#message-object) and \[modal](/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal). You can use them when creating messages or responding to an interaction, like an \[application command](/developers/docs/interactions/application-commands).



\### Component Object\[



](#component-object)



\###### Component Types\[



](#component-object-component-types)



The following is a complete table of available components. Details about each component are in the sections below.



Type



Name



Description



Style



Usage



1



\[Action Row](/developers/docs/components/reference#action-row)



Container to display a row of interactive components



Layout



Message



2



\[Button](/developers/docs/components/reference#button)



Button object



Interactive



Message



3



\[String Select](/developers/docs/components/reference#string-select)



Select menu for picking from defined text options



Interactive



Message, Modal



4



\[Text Input](/developers/docs/components/reference#text-input)



Text input object



Interactive



Modal



5



\[User Select](/developers/docs/components/reference#user-select)



Select menu for users



Interactive



Message, Modal



6



\[Role Select](/developers/docs/components/reference#role-select)



Select menu for roles



Interactive



Message, Modal



7



\[Mentionable Select](/developers/docs/components/reference#mentionable-select)



Select menu for mentionables (users and roles)



Interactive



Message, Modal



8



\[Channel Select](/developers/docs/components/reference#channel-select)



Select menu for channels



Interactive



Message, Modal



9



\[Section](/developers/docs/components/reference#section)



Container to display text alongside an accessory component



Layout



Message



10



\[Text Display](/developers/docs/components/reference#text-display)



Markdown text



Content



Message, Modal



11



\[Thumbnail](/developers/docs/components/reference#thumbnail)



Small image that can be used as an accessory



Content



Message



12



\[Media Gallery](/developers/docs/components/reference#media-gallery)



Display images and other media



Content



Message



13



\[File](/developers/docs/components/reference#file)



Displays an attached file



Content



Message



14



\[Separator](/developers/docs/components/reference#separator)



Component to add vertical padding between other components



Layout



Message



17



\[Container](/developers/docs/components/reference#container)



Container that visually groups a set of components



Layout



Message



18



\[Label](/developers/docs/components/reference#label)



Container associating a label and description with a component



Layout



Modal



19



\[File Upload](/developers/docs/components/reference#file-upload)



Component for uploading files



Interactive



Modal



\* \* \*



Anatomy of a Component\[



](#anatomy-of-a-component)

---------------------------------------------------



All components have the following fields:



Field



Type



Description



type



integer



The \[type](/developers/docs/components/reference#component-object-component-types) of the component



id?



integer



32 bit integer used as an optional identifier for component



The `id` field is optional and is used to identify components in the response from an interaction. The `id` must be unique within the message and is generated sequentially if left empty. Generation of `id`s won't use another `id` that exists in the message if you have one defined for another component. Sending components with an `id` of `0` is allowed but will be treated as empty and replaced by the API.



\###### Custom ID\[



](#anatomy-of-a-component-custom-id)



Additionally, interactive components like buttons and selects must have a `custom\_id` field. The developer defines this field when sending the component payload, and it is returned in the interaction payload sent when a user interacts with the component. For example, if you set `custom\_id: click\_me` on a button, you'll receive an interaction containing `custom\_id: click\_me` when a user clicks that button.



`custom\_id` is only available on interactive components and must be unique per component. Multiple components on the same message must not share the same `custom\_id`. This field is a string of 1 to 100 characters and can be used flexibly to maintain state or pass through other important data.



Field



Type



Description



custom\\\_id



string



Developer-defined identifier, 1-100 characters



\* \* \*



Action Row\[



](#action-row)

---------------------------



An Action Row is a top-level layout component.



Action Rows can contain one of the following:



\*   Up to 5 contextually grouped \[buttons](/developers/docs/components/reference#button)

\*   A single select component (\[string select](/developers/docs/components/reference#string-select), \[user select](/developers/docs/components/reference#user-select), \[role select](/developers/docs/components/reference#role-select), \[mentionable select](/developers/docs/components/reference#mentionable-select), or \[channel select](/developers/docs/components/reference#channel-select))



\[Label](/developers/docs/components/reference#label) is recommended for use over an Action Row in modals. Action Row with Text Inputs in modals are now deprecated.



\###### Action Row Structure\[



](#action-row-action-row-structure)



Field



Type



Description



type



integer



`1` for action row component



id?



integer



Optional identifier for component



components



array of \[action row child components](/developers/docs/components/reference#component-object-component-types)



Up to 5 interactive \[button](/developers/docs/components/reference#button) components or a single \[select](/developers/docs/components/reference#user-select) component



\###### Action Row Child Components\[



](#action-row-action-row-child-components)



Available Components



Description



\[Button](/developers/docs/components/reference#button)



An Action Row can contain up to 5 Buttons



\[String Select](/developers/docs/components/reference#string-select)



A single String Select



\[User Select](/developers/docs/components/reference#user-select)



A single User Select



\[Role Select](/developers/docs/components/reference#role-select)



A single Role Select



\[Mentionable Select](/developers/docs/components/reference#mentionable-select)



A single Mentionable Select



\[Channel Select](/developers/docs/components/reference#channel-select)



A single Channel Select



\###### Examples\[



](#action-row-examples)



Message Example



Message create payload with an Action Row component



Rendered Example



Visualization of the message created by the payload below



!\[Example of an Action Row with three buttons](/assets/a943f4d7bb044d33.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1,  // ComponentType.ACTION\_ROW

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 2,  // ComponentType.BUTTON

&nbsp;             "custom\_id": "click\_yes"

&nbsp;             "label": "Accept",

&nbsp;             "style": 1,

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 2,  // ComponentType.BUTTON

&nbsp;             "label": "Learn More",

&nbsp;             "style": 5,

&nbsp;             "url": "http://watchanimeattheoffice.com/"

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 2,  // ComponentType.BUTTON

&nbsp;             "custom\_id": "click\_no"

&nbsp;             "label": "Decline",

&nbsp;             "style": 4,

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



\* \* \*



Button\[



](#button)

-------------------



A Button is an interactive component that can only be used in messages. It creates clickable elements that users can interact with, sending an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object) to your app when clicked.



Buttons must be placed inside an \[Action Row](/developers/docs/components/reference#action-row) or a \[Section](/developers/docs/components/reference#section)'s `accessory` field.



\###### Button Structure\[



](#button-button-structure)



Field



Type



Description



type



integer



`2` for a button



id?



integer



Optional identifier for component



style



integer



A \[button style](/developers/docs/components/reference#button-button-styles)



label?



string



Text that appears on the button; max 80 characters



emoji?



partial \[emoji](/developers/docs/resources/emoji#emoji-object)



`name`, `id`, and `animated`



custom\\\_id



string



Developer-defined identifier for the button; 1-100 characters



sku\\\_id?



snowflake



Identifier for a purchasable \[SKU](/developers/docs/resources/sku#sku-object), only available when using premium-style buttons



url?



string



URL for link-style buttons; max 512 characters



disabled?



boolean



Whether the button is disabled (defaults to `false`)



Buttons come in various styles to convey different types of actions. These styles also define what fields are valid for a button.



\*   Non-link and non-premium buttons must have a `custom\_id`, and cannot have a `url` or a `sku\_id`.

\*   Link buttons must have a `url`, and cannot have a `custom\_id`

\*   Link buttons do not send an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object) to your app when clicked

\*   Premium buttons must contain a `sku\_id`, and cannot have a `custom\_id`, `label`, `url`, or `emoji`.

\*   Premium buttons do not send an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object) to your app when clicked



\###### Button Styles\[



](#button-button-styles)



Name



Value



Action



Required Field



Primary



1



The most important or recommended action in a group of options



`custom\_id`



Secondary



2



Alternative or supporting actions



`custom\_id`



Success



3



Positive confirmation or completion actions



`custom\_id`



Danger



4



An action with irreversible consequences



`custom\_id`



Link



5



Navigates to a URL



`url`



Premium



6



Purchase



`sku\_id`



\###### Examples\[



](#button-examples)



Message Example



Message create payload with a Button component



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1,  // ComponentType.ACTION\_ROW

&nbsp;         "components": \[

&nbsp;             {

&nbsp;               "type": 2,  // ComponentType.BUTTON,

&nbsp;               "custom\_id": "click\_me",

&nbsp;               "label": "Click me!",

&nbsp;               "style": 1

&nbsp;             }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



Message Interaction Response Example



When a user interacts with a Button in a message



When a user interacts with a Button in a message, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 3, // InteractionType.MESSAGE\_COMPONENT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "component\_type": 2, // ComponentType.BUTTON

&nbsp;       "id": 2,

&nbsp;       "custom\_id": "click\_me",

&nbsp;     },

&nbsp;   }

&nbsp;   



\### Button Design Guidelines\[



](#button-design-guidelines)



\###### General Button Content\[



](#button-design-guidelines-general-button-content)



\*   34 characters max with icon or emoji.

\*   38 characters max without icon or emoji.

\*   Keep text concise and to the point.

\*   Use clear and easily understandable language. Avoid jargon or overly technical terms.

\*   Use verbs that indicate the outcome of the action.

\*   Maintain consistency in language and tone across buttons.

\*   Anticipate the need for translation and test for expansion or contraction in different languages.



\###### Multiple Buttons\[



](#button-design-guidelines-multiple-buttons)



Use different button styles to create a hierarchy. Use only one `Primary` button per group.



!\[Example showing one primary button per button group](/assets/57dd9b1bd1e0f605.webp)



If there are multiple buttons of equal significance, use the `Secondary` button style for all buttons.



!\[Example showing multiple buttons in a group with equal significance](/assets/dc64748641dbfbd7.webp)



\###### Premium Buttons\[



](#button-design-guidelines-premium-buttons)



Premium buttons will automatically have the following:



\*   Shop Icon

\*   SKU name

\*   SKU price



!\[A premium button](/assets/e378de3750057bbc.webp)



\* \* \*



String Select\[



](#string-select)

---------------------------------



A String Select is an interactive component that allows users to select one or more provided `options`.



String Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure).



String Selects are available in messages and modals. They must be placed inside an \[Action Row](/developers/docs/components/reference#action-row) in messages and a \[Label](/developers/docs/components/reference#label) in modals.



\###### String Select Structure\[



](#string-select-string-select-structure)



Field



Type



Description



type



integer



`3` for string select



id?



integer



Optional identifier for component



custom\\\_id



string



ID for the select menu; 1-100 characters



options



array of \[select options](/developers/docs/components/reference#string-select-select-option-structure)



Specified choices in a select menu; max 25



placeholder?



string



Placeholder text if nothing is selected or default; max 150 characters



min\\\_values?



integer



Minimum number of items that must be chosen (defaults to 1); min 0, max 25



max\\\_values?



integer



Maximum number of items that can be chosen (defaults to 1); max 25



required?\\\*



boolean



Whether the string select is required to answer in a modal (defaults to `true`)



disabled?\\\*\\\*



boolean



Whether select menu is disabled in a message (defaults to `false`)



\\\* The `required` field is only available for String Selects in modals. It is ignored in messages.



\\\*\\\* Using `disabled` in a modal will result in an error. Modals can not currently have disabled components in them.



\###### Select Option Structure\[



](#string-select-select-option-structure)



Field



Type



Description



label



string



User-facing name of the option; max 100 characters



value



string



Dev-defined value of the option; max 100 characters



description?



string



Additional description of the option; max 100 characters



emoji?



partial \[emoji](/developers/docs/resources/emoji#emoji-object) object



`id`, `name`, and `animated`



default?



boolean



Will show this option as selected by default



\###### String Select Interaction Response Structure\[



](#string-select-string-select-interaction-response-structure)



Field



Type



Description



type\\\*



integer



`3` for a String Select



component\\\_type\\\*



integer



`3` for a String Select



id



integer



Unique identifier for the component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



values



array of strings



The text of the selected options



\\\* In message interaction responses `component\_type` will be returned and in modal interaction responses `type` will be returned.



\###### Examples\[



](#string-select-examples)



Message Example



Message create payload with a String Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a String Select with three options](/assets/6d325d5d5cf8a02f.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1, // ComponentType.ACTION\_ROW,

&nbsp;         "id": 1,

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 3, // ComponentType.STRING\_SELECT

&nbsp;             "id": 2,

&nbsp;             "custom\_id": "favorite\_bug",

&nbsp;             "placeholder": "Favorite bug?",

&nbsp;             "options": \[

&nbsp;               {

&nbsp;                 "label": "Ant",

&nbsp;                 "value": "ant",

&nbsp;                 "description": "(best option)",

&nbsp;                 "emoji": {"name": "🐜"}

&nbsp;               },

&nbsp;               {

&nbsp;                 "label": "Butterfly",

&nbsp;                 "value": "butterfly",

&nbsp;                 "emoji": {"name": "🦋"}

&nbsp;               },

&nbsp;               {

&nbsp;                 "label": "Caterpillar",

&nbsp;                 "value": "caterpillar",

&nbsp;                 "emoji": {"name": "🐛"}

&nbsp;               }

&nbsp;             ]

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



Message Interaction Data Example



When a user interacts with a StringSelect in a message



When a user interacts with a StringSelect in a message, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 3, // InteractionType.MESSAGE\_COMPONENT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "component\_type": 3, // ComponentType.STRING\_SELECT

&nbsp;       "custom\_id": "favorite\_bug",

&nbsp;       "values": \[

&nbsp;         "butterfly",

&nbsp;       ]

&nbsp;     },

&nbsp;   }

&nbsp;   



Modal Example



Modal create payload with a String Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a modal with a String Select](/assets/2de01455aff22e1f.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9, // InteractionCallbackType.MODAL

&nbsp;     "data": {

&nbsp;       "custom\_id": "bug\_modal",

&nbsp;       "title": "Bug Survey",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18, // ComponentType.LABEL

&nbsp;           "id": 1,

&nbsp;           "label": "Favorite bug?",

&nbsp;           "component": {

&nbsp;             "type": 3, // ComponentType.STRING\_SELECT

&nbsp;             "id": 2,

&nbsp;             "custom\_id": "favorite\_bug",

&nbsp;             "placeholder": "Ants are the best",

&nbsp;             "options": \[

&nbsp;               {

&nbsp;                 "label": "Ant",

&nbsp;                 "value": "ant",

&nbsp;                 "description": "(best option)",

&nbsp;                 "emoji": {"name": "🐜"}

&nbsp;               },

&nbsp;               {

&nbsp;                 "label": "Butterfly",

&nbsp;                 "value": "butterfly",

&nbsp;                 "emoji": {"name": "🦋"}

&nbsp;               },

&nbsp;               {

&nbsp;                 "label": "Caterpillar",

&nbsp;                 "value": "caterpillar",

&nbsp;                 "emoji": {"name": "🐛"}

&nbsp;               }

&nbsp;             ]

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



Modal Submit Interaction Data Example



When a user submits a modal containing a String Select



When a user submits a modal that contains a String Select, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 5, // InteractionType.MODAL\_SUBMIT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "custom\_id": "bug\_modal",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18, // ComponentType.LABEL

&nbsp;           "id": 1,

&nbsp;           "component": {

&nbsp;             "type": 3, // ComponentType.STRING\_SELECT

&nbsp;             "id": 2,

&nbsp;             "custom\_id": "favorite\_bug",

&nbsp;             "values": \[

&nbsp;               "butterfly",

&nbsp;             ]

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     },

&nbsp;   }

&nbsp;   



\* \* \*



Text Input\[



](#text-input)

---------------------------



Text Input is an interactive component that allows users to enter free-form text responses in modals. It supports both short, single-line inputs and longer, multi-line paragraph inputs.



Text Inputs can only be used within modals and must be placed inside a \[Label](/developers/docs/components/reference#label).



We no longer recommend using Text Input within an \[Action Row](/developers/docs/components/reference#action-row) in modals. Going forward all Text Inputs should be placed inside a \[Label](/developers/docs/components/reference#label) component.



\###### Text Input Structure\[



](#text-input-text-input-structure)



Field



Type



Description



type



integer



`4` for a text input



id?



integer



Optional identifier for component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



style



integer



The \[Text Input Style](/developers/docs/components/reference#text-input-text-input-styles)



min\\\_length?



integer



Minimum input length for a text input; min 0, max 4000



max\\\_length?



integer



Maximum input length for a text input; min 1, max 4000



required?



boolean



Whether this component is required to be filled (defaults to `true`)



value?



string



Pre-filled value for this component; max 4000 characters



placeholder?



string



Custom placeholder text if the input is empty; max 100 characters



The `label` field on a Text Input is deprecated in favor of `label` and `description` on the \[Label](/developers/docs/components/reference#label) component.



\###### Text Input Styles\[



](#text-input-text-input-styles)



Name



Value



Description



Short



1



Single-line input



Paragraph



2



Multi-line input



\###### Text Input Interaction Response Structure\[



](#text-input-text-input-interaction-response-structure)



Field



Type



Description



type



integer



`4` for a Text Input



id



integer



Unique identifier for the component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



value



string



The user's input text



\###### Examples\[



](#text-input-examples)



Modal Example



Modal create payload with a Text Input component



Rendered Example



Visualization of the modal created by the payload below



!\[A modal with Text Input in a Label](/assets/4561c3530edbb293.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9, // InteractionCallbackType.MODAL

&nbsp;     "data": {

&nbsp;       "custom\_id": "game\_feedback\_modal",

&nbsp;       "title": "Game Feedback",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18,  // ComponentType.LABEL

&nbsp;           "label": "What did you find interesting about the game?",

&nbsp;           "description": "Please give us as much detail as possible so we can improve the game!",

&nbsp;           "component": {

&nbsp;             "type": 4,  // ComponentType.TEXT\_INPUT

&nbsp;             "custom\_id": "game\_feedback",

&nbsp;             "style": 2,

&nbsp;             "min\_length": 100,

&nbsp;             "max\_length": 4000,

&nbsp;             "placeholder": "Write your feedback here...",

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



Modal Submit Interaction Data Example



When a user submits a modal containing a TextInput



When a user submits a modal that contains a TextInput, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 5, // InteractionType.MODAL\_SUBMIT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "custom\_id": "game\_feedback\_modal",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18, // ComponentType.LABEL

&nbsp;           "id": 1,

&nbsp;           "component": {

&nbsp;             "type": 4, // ComponentType.TEXT\_INPUT

&nbsp;             "id": 2,

&nbsp;             "custom\_id": "game\_feedback",

&nbsp;             "value": "The recent changes to acceleration feel much better, but shadows still need help"

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     },

&nbsp;   }

&nbsp;   



\* \* \*



User Select\[



](#user-select)

-----------------------------



A User Select is an interactive component that allows users to select one or more users in a message or modal. Options are automatically populated based on the server's available users.



User Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure).



User Selects are available in messages and modals. They must be placed inside an \[Action Row](/developers/docs/components/reference#action-row) in messages and a \[Label](/developers/docs/components/reference#label) in modals.



\###### User Select Structure\[



](#user-select-user-select-structure)



Field



Type



Description



type



integer



`5` for user select



id?



integer



Optional identifier for component



custom\\\_id



string



ID for the select menu; 1-100 characters



placeholder?



string



Placeholder text if nothing is selected; max 150 characters



default\\\_values?



array of \[default value objects](/developers/docs/components/reference#user-select-select-default-value-structure)



List of default values for auto-populated select menu components; number of default values must be in the range defined by `min\_values` and `max\_values`



min\\\_values?



integer



Minimum number of items that must be chosen (defaults to 1); min 0, max 25



max\\\_values?



integer



Maximum number of items that can be chosen (defaults to 1); max 25



required?\\\*



boolean



Whether the user select is required to answer in a modal (defaults to `true`)



disabled?\\\*\\\*



boolean



Whether select menu is disabled in a message (defaults to `false`)



\\\* The `required` field is only available for User Selects in modals. It is ignored in messages.



\\\*\\\* Using `disabled` in a modal will result in an error. Modals can not currently have disabled components in them.



\###### Select Default Value Structure\[



](#user-select-select-default-value-structure)



Field



Type



Description



id



snowflake



ID of a user, role, or channel



type



string



Type of value that `id` represents. Either `"user"`, `"role"`, or `"channel"`



\###### User Select Interaction Response Structure\[



](#user-select-user-select-interaction-response-structure)



Field



Type



Description



type\\\*



integer



`5` for a User Select



component\\\_type\\\*



integer



`5` for a User Select



id



integer



Unique identifier for the component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



resolved



\[resolved data](/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure)



Resolved entities from selected options



values



array of snowflakes



IDs of the selected users



\\\* In message interaction responses `component\_type` will be returned and in modal interaction responses `type` will be returned.



\###### Examples\[



](#user-select-examples)



Message Example



Message create payload with a User Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a User Select with two people and an app in a server](/assets/db910104339f70c7.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1,  // ComponentType.ACTION\_ROW

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 5,  // ComponentType.USER\_SELECT

&nbsp;             "custom\_id": "user\_select",

&nbsp;             "placeholder": "Select a user"

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



Message Interaction Data Example



When a user interacts with a User Select in a message



When a user interacts with a User Select in a message, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



`members` and `users` may both be present in the `resolved` object when a user is selected.



Copy



&nbsp;   {

&nbsp;     "type": 3, // InteractionType.MESSAGE\_COMPONENT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "component\_type": 5, // ComponentType.USER\_SELECT

&nbsp;       "id": 2,

&nbsp;       "custom\_id": "user\_select",

&nbsp;       "values": \[

&nbsp;         "1111111111111111111",

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "members": {

&nbsp;           "1111111111111111111": {

&nbsp;             "avatar": null,

&nbsp;             "banner": null,

&nbsp;             "collectibles": null,

&nbsp;             "communication\_disabled\_until": null,

&nbsp;             "flags": 0,

&nbsp;             "joined\_at": "2025-05-16T22:51:16.692000+00:00",

&nbsp;             "nick": null,

&nbsp;             "pending": false,

&nbsp;             "permissions": "2248473465835073",

&nbsp;             "premium\_since": null,

&nbsp;             "roles": \[

&nbsp;               "2222222222222222222"

&nbsp;             ],

&nbsp;             "unusual\_dm\_activity\_until": null

&nbsp;           }

&nbsp;         },

&nbsp;         "users": {

&nbsp;           "1111111111111111111": {

&nbsp;             "avatar": "d54e87d20539fe9aad2f2cebe56809a2",

&nbsp;             "avatar\_decoration\_data": null,

&nbsp;             "bot": true,

&nbsp;             "clan": null,

&nbsp;             "collectibles": null,

&nbsp;             "discriminator": "9062",

&nbsp;             "display\_name\_styles": null,

&nbsp;             "global\_name": null,

&nbsp;             "id": "1111111111111111111",

&nbsp;             "primary\_guild": null,

&nbsp;             "public\_flags": 524289,

&nbsp;             "username": "ExampleBot"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     },

&nbsp;   }

&nbsp;   



Modal Example



Modal create payload with a User Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a modal with a User Select](/assets/6321505ce77194a4.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9,

&nbsp;     "data": {

&nbsp;       "custom\_id": "user\_modal",

&nbsp;       "title": "User Chooser",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18, // ComponentType.LABEL

&nbsp;           "label": "Choose your users",

&nbsp;           "component": {

&nbsp;             "type": 5, // ComponentType.USER\_SELECT

&nbsp;             "custom\_id": "user\_selected",

&nbsp;             "max\_values": 5,

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



Modal Submit Interaction Data Example



When a user submits a modal containing a User Select



When a user submits a modal that contains a User Select, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 5, // InteractionType.MODAL\_SUBMIT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "custom\_id": "user\_modal",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "component": {

&nbsp;             "custom\_id": "user\_selected",

&nbsp;             "id": 2,

&nbsp;             "type": 5,

&nbsp;             "values": \[

&nbsp;               "11111111111111111"

&nbsp;             ]

&nbsp;           },

&nbsp;           "id": 1,

&nbsp;           "type": 18

&nbsp;         }

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "members": {

&nbsp;           "11111111111111111": {

&nbsp;             "avatar": null,

&nbsp;             "banner": null,

&nbsp;             "collectibles": null,

&nbsp;             "communication\_disabled\_until": null,

&nbsp;             "flags": 0,

&nbsp;             "joined\_at": "2025-04-02T23:07:21.476000+00:00",

&nbsp;             "nick": "Ant",

&nbsp;             "pending": false,

&nbsp;             "permissions": "4503599627370495",

&nbsp;             "premium\_since": null,

&nbsp;             "roles": \[

&nbsp;               "1357409927680889032"

&nbsp;             ],

&nbsp;             "unusual\_dm\_activity\_until": null

&nbsp;           }

&nbsp;         },

&nbsp;         "users": {

&nbsp;           "11111111111111111": {

&nbsp;             "avatar": "a\_b15bd8ee42e3c3d9a7de129fee60bc84",

&nbsp;             "avatar\_decoration\_data": null,

&nbsp;             "clan": null,

&nbsp;             "collectibles": {

&nbsp;               "nameplate": {

&nbsp;                 "asset": "nameplates/spell/white\_mana/",

&nbsp;                 "expires\_at": null,

&nbsp;                 "label": "COLLECTIBLES\_SPELL\_WHITE\_MANA\_NP\_A11Y",

&nbsp;                 "palette": "bubble\_gum",

&nbsp;                 "sku\_id": "1379220459203072050"

&nbsp;               }

&nbsp;             },

&nbsp;             "discriminator": "0",

&nbsp;             "display\_name\_styles": {

&nbsp;               "colors": \[

&nbsp;                 16777215

&nbsp;               ],

&nbsp;               "effect\_id": 4,

&nbsp;               "font\_id": 3

&nbsp;             },

&nbsp;             "global\_name": "Anthony",

&nbsp;             "id": "11111111111111111",

&nbsp;             "primary\_guild": null,

&nbsp;             "public\_flags": 65,

&nbsp;             "username": "actuallyanthony"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp;   



\* \* \*



Role Select\[



](#role-select)

-----------------------------



A Role Select is an interactive component that allows users to select one or more roles in a message or modal. Options are automatically populated based on the server's available roles.



Role Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure).



Role Selects are available in messages and modals. They must be placed inside an \[Action Row](/developers/docs/components/reference#action-row) in messages and a \[Label](/developers/docs/components/reference#label) in modals.



\###### Role Select Structure\[



](#role-select-role-select-structure)



Field



Type



Description



type



integer



`6` for role select



id?



integer



Optional identifier for component



custom\\\_id



string



ID for the select menu; 1-100 characters



placeholder?



string



Placeholder text if nothing is selected; max 150 characters



default\\\_values?



array of \[default value objects](/developers/docs/components/reference#user-select-select-default-value-structure)



List of default values for auto-populated select menu components; number of default values must be in the range defined by `min\_values` and `max\_values`



min\\\_values?



integer



Minimum number of items that must be chosen (defaults to 1); min 0, max 25



max\\\_values?



integer



Maximum number of items that can be chosen (defaults to 1); max 25



required?\\\*



boolean



Whether the role select is required to answer in a modal (defaults to `true`)



disabled?\\\*\\\*



boolean



Whether select menu is disabled in a message (defaults to `false`)



\\\* The `required` field is only available for Role Selects in modals. It is ignored in messages.



\\\*\\\* Using `disabled` in a modal will result in an error. Modals can not currently have disabled components in them.



\###### Role Select Interaction Response Structure\[



](#role-select-role-select-interaction-response-structure)



Field



Type



Description



type\\\*



integer



`6` for a Role Select



component\\\_type\\\*



integer



`6` for a Role Select



id



integer



Unique identifier for the component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



resolved



\[resolved data](/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure)



Resolved entities from selected options



values



array of snowflakes



IDs of the selected roles



\\\* In message interaction responses `component\_type` will be returned and in modal interaction responses `type` will be returned.



\###### Examples\[



](#role-select-examples)



Message Example



Message create payload with a Role Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a Role Select allowing up to 3 choices](/assets/ecc738f1b7d4e685.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1,  // ComponentType.ACTION\_ROW

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 6,  // ComponentType.ROLE\_SELECT

&nbsp;             "custom\_id": "role\_ids",

&nbsp;             "placeholder": "Which roles?",

&nbsp;             "min\_values": 1,

&nbsp;             "max\_values": 3

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



Message Interaction Data Example



When a user interacts with a Role Select in a message



When a user interacts with a Role Select in a message, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 3, // InteractionType.MESSAGE\_COMPONENT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "component\_type": 6, // ComponentType.ROLE\_SELECT

&nbsp;       "id": 2,

&nbsp;       "custom\_id": "role\_ids",

&nbsp;       "values": \[

&nbsp;         "222222222222222222",

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "roles": {

&nbsp;           "222222222222222222": {

&nbsp;             "color": 12745742,

&nbsp;             "colors": {

&nbsp;               "primary\_color": 12745742,

&nbsp;               "secondary\_color": null,

&nbsp;               "tertiary\_color": null

&nbsp;             },

&nbsp;             "description": null,

&nbsp;             "flags": 0,

&nbsp;             "hoist": false,

&nbsp;             "icon": null,

&nbsp;             "id": "222222222222222222",

&nbsp;             "managed": false,

&nbsp;             "mentionable": true,

&nbsp;             "name": "Developer",

&nbsp;             "permissions": "0",

&nbsp;             "position": 2,

&nbsp;             "unicode\_emoji": "🔧"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     },

&nbsp;   }

&nbsp;   



Modal Example



Modal create payload with a Role Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a modal with a Role Select](/assets/327600f966e25ab1.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9,

&nbsp;     "data": {

&nbsp;       "custom\_id": "role\_modal",

&nbsp;       "title": "Role Select",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18,

&nbsp;           "label": "Select which roles to assign",

&nbsp;           "component": {

&nbsp;             "type": 6,

&nbsp;             "custom\_id": "roles\_selected",

&nbsp;             "max\_values": 10,

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



Modal Submit Interaction Data Example



When a user submits a modal containing a Role Select



When a user submits a modal that contains a Role Select, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 5, // InteractionType.MODAL\_SUBMIT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "custom\_id": "role\_modal",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "component": {

&nbsp;             "custom\_id": "roles\_selected",

&nbsp;             "id": 2,

&nbsp;             "type": 6,

&nbsp;             "values": \[

&nbsp;               "1362213912946147499",

&nbsp;               "1357409927680889032"

&nbsp;             ]

&nbsp;           },

&nbsp;           "id": 1,

&nbsp;           "type": 18

&nbsp;         }

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "roles": {

&nbsp;           "1357409927680889032": {

&nbsp;             "color": 7419530,

&nbsp;             "colors": {

&nbsp;               "primary\_color": 7419530,

&nbsp;               "secondary\_color": null,

&nbsp;               "tertiary\_color": null

&nbsp;             },

&nbsp;             "description": null,

&nbsp;             "flags": 0,

&nbsp;             "hoist": true,

&nbsp;             "icon": null,

&nbsp;             "id": "1357409927680889032",

&nbsp;             "managed": false,

&nbsp;             "mentionable": true,

&nbsp;             "name": "Player",

&nbsp;             "permissions": "2249596494938111",

&nbsp;             "position": 3,

&nbsp;             "unicode\_emoji": "🎮"

&nbsp;           },

&nbsp;           "1362213912946147499": {

&nbsp;             "color": 11342935,

&nbsp;             "colors": {

&nbsp;               "primary\_color": 11342935,

&nbsp;               "secondary\_color": null,

&nbsp;               "tertiary\_color": null

&nbsp;             },

&nbsp;             "description": null,

&nbsp;             "flags": 0,

&nbsp;             "hoist": false,

&nbsp;             "icon": null,

&nbsp;             "id": "1362213912946147499",

&nbsp;             "managed": false,

&nbsp;             "mentionable": false,

&nbsp;             "name": "Mod",

&nbsp;             "permissions": "0",

&nbsp;             "position": 1,

&nbsp;             "unicode\_emoji": "🔨"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp;   



\* \* \*



Mentionable Select\[



](#mentionable-select)

-------------------------------------------



A Mentionable Select is an interactive component that allows users to select one or more mentionables in a message or modal. Options are automatically populated based on available mentionables in the server.



Mentionable Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s), your app receives an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure).



Mentionable Selects are available in messages and modals. They must be placed inside an \[Action Row](/developers/docs/components/reference#action-row) in messages and a \[Label](/developers/docs/components/reference#label) in modals.



\###### Mentionable Select Structure\[



](#mentionable-select-mentionable-select-structure)



Field



Type



Description



type



integer



`7` for mentionable select



id?



integer



Optional identifier for component



custom\\\_id



string



ID for the select menu; 1-100 characters



placeholder?



string



Placeholder text if nothing is selected; max 150 characters



default\\\_values?



array of \[default value objects](/developers/docs/components/reference#user-select-select-default-value-structure)



List of default values for auto-populated select menu components; number of default values must be in the range defined by `min\_values` and `max\_values`



min\\\_values?



integer



Minimum number of items that must be chosen (defaults to 1); min 0, max 25



max\\\_values?



integer



Maximum number of items that can be chosen (defaults to 1); max 25



required?\\\*



boolean



Whether the mentionable select is required to answer in a modal (defaults to `true`)



disabled?\\\*\\\*



boolean



Whether select menu is disabled in a message (defaults to `false`)



\\\* The `required` field is only available for Mentionable Selects in modals. It is ignored in messages.



\\\*\\\* Using `disabled` in a modal will result in an error. Modals can not currently have disabled components in them.



\###### Mentionable Select Interaction Response Structure\[



](#mentionable-select-mentionable-select-interaction-response-structure)



Field



Type



Description



type\\\*



integer



`7` for a Mentionable Select



component\\\_type\\\*



integer



`7` for a Mentionable Select



id



integer



Unique identifier for the component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



resolved



\[resolved data](/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure)



Resolved entities from selected options



values



array of snowflakes



IDs of the selected mentionables



\\\* In message interaction responses `component\_type` will be returned and in modal interaction responses `type` will be returned.



\###### Examples\[



](#mentionable-select-examples)



Message Example



Message create payload with a Mentionable Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a Mentionable Select](/assets/9ff81e3e228d11ab.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1,  // ComponentType.ACTION\_ROW

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 7, // ComponentType.MENTIONABLE\_SELECT

&nbsp;             "custom\_id": "who\_to\_ping",

&nbsp;             "placeholder": "Who?",

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



Message Interaction Data Example



When a user interacts with a Mentionable Select in a message



When a user interacts with a Mentionable Select in a message, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



`members` and `users` may both be present in the `resolved` object when a user is selected.



Copy



&nbsp;   {

&nbsp;     "type": 3, // InteractionType.MESSAGE\_COMPONENT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "component\_type": 7, // ComponentType.MENTIONABLE\_SELECT

&nbsp;       "id": 2,

&nbsp;       "custom\_id": "who\_to\_ping",

&nbsp;       "values": \[

&nbsp;         "111111111111111111",

&nbsp;         "222222222222222222",

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "members": {

&nbsp;           "1111111111111111111": {

&nbsp;             "avatar": null,

&nbsp;             "banner": null,

&nbsp;             "collectibles": null,

&nbsp;             "communication\_disabled\_until": null,

&nbsp;             "flags": 0,

&nbsp;             "joined\_at": "2025-05-16T22:51:16.692000+00:00",

&nbsp;             "nick": null,

&nbsp;             "pending": false,

&nbsp;             "permissions": "2248473465835073",

&nbsp;             "premium\_since": null,

&nbsp;             "roles": \[

&nbsp;               "2222222222222222222"

&nbsp;             ],

&nbsp;             "unusual\_dm\_activity\_until": null

&nbsp;           }

&nbsp;         },

&nbsp;         "users": {

&nbsp;           "1111111111111111111": {

&nbsp;             "avatar": "d54e87d20539fe9aad2f2cebe56809a2",

&nbsp;             "avatar\_decoration\_data": null,

&nbsp;             "bot": true,

&nbsp;             "clan": null,

&nbsp;             "collectibles": null,

&nbsp;             "discriminator": "9062",

&nbsp;             "display\_name\_styles": null,

&nbsp;             "global\_name": null,

&nbsp;             "id": "1111111111111111111",

&nbsp;             "primary\_guild": null,

&nbsp;             "public\_flags": 524289,

&nbsp;             "username": "ExampleBot"

&nbsp;           }

&nbsp;         },

&nbsp;         "roles": {

&nbsp;           "222222222222222222": {

&nbsp;             "color": 12745742,

&nbsp;             "colors": {

&nbsp;               "primary\_color": 12745742,

&nbsp;               "secondary\_color": null,

&nbsp;               "tertiary\_color": null

&nbsp;             },

&nbsp;             "description": null,

&nbsp;             "flags": 0,

&nbsp;             "hoist": false,

&nbsp;             "icon": null,

&nbsp;             "id": "222222222222222222",

&nbsp;             "managed": false,

&nbsp;             "mentionable": true,

&nbsp;             "name": "Developer",

&nbsp;             "permissions": "0",

&nbsp;             "position": 2,

&nbsp;             "unicode\_emoji": "🔧"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     },

&nbsp;   }

&nbsp;   



Modal Example



Modal create payload with a Mentionable Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a modal with a Mentionable Select](/assets/c0f6d50c6cab85d7.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9,

&nbsp;     "data": {

&nbsp;       "custom\_id": "mentionable\_modal",

&nbsp;       "title": "Unmentionables",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18,

&nbsp;           "label": "Who gets mentioned?",

&nbsp;           "component": {

&nbsp;             "type": 7,

&nbsp;             "custom\_id": "mentionables\_selected",

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



Modal Submit Interaction Data Example



When a user submits a modal containing a Mentionable Select



When a user submits a modal that contains a Mentionable Select, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 5, // InteractionType.MODAL\_SUBMIT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "custom\_id": "mentionable\_modal",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "component": {

&nbsp;             "custom\_id": "mentionables\_selected",

&nbsp;             "id": 2,

&nbsp;             "type": 7,

&nbsp;             "values": \[

&nbsp;               "1361539726405926952"

&nbsp;             ]

&nbsp;           },

&nbsp;           "id": 1,

&nbsp;           "type": 18

&nbsp;         }

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "roles": {

&nbsp;           "1361539726405926952": {

&nbsp;             "color": 12745742,

&nbsp;             "colors": {

&nbsp;               "primary\_color": 12745742,

&nbsp;               "secondary\_color": null,

&nbsp;               "tertiary\_color": null

&nbsp;             },

&nbsp;             "description": null,

&nbsp;             "flags": 0,

&nbsp;             "hoist": false,

&nbsp;             "icon": null,

&nbsp;             "id": "1361539726405926952",

&nbsp;             "managed": false,

&nbsp;             "mentionable": true,

&nbsp;             "name": "Developer",

&nbsp;             "permissions": "0",

&nbsp;             "position": 2,

&nbsp;             "unicode\_emoji": "🔧"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp;   



\* \* \*



Channel Select\[



](#channel-select)

-----------------------------------



A Channel Select is an interactive component that allows users to select one or more channels in a message or modal. Options are automatically populated based on available channels in the server and can be filtered by channel types.



Channel Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure).



Channel Selects are available in messages and modals. They must be placed inside an \[Action Row](/developers/docs/components/reference#action-row) in messages and a \[Label](/developers/docs/components/reference#label) in modals.



\###### Channel Select Structure\[



](#channel-select-channel-select-structure)



Field



Type



Description



type



integer



`8` for channel select



id?



integer



Optional identifier for component



custom\\\_id



string



ID for the select menu; 1-100 characters



channel\\\_types?



array of \[channel types](/developers/docs/resources/channel#channel-object-channel-types)



List of channel types to include in the channel select component



placeholder?



string



Placeholder text if nothing is selected; max 150 characters



default\\\_values?



array of \[default value objects](/developers/docs/components/reference#user-select-select-default-value-structure)



List of default values for auto-populated select menu components; number of default values must be in the range defined by `min\_values` and `max\_values`



min\\\_values?



integer



Minimum number of items that must be chosen (defaults to 1); min 0, max 25



max\\\_values?



integer



Maximum number of items that can be chosen (defaults to 1); max 25



required?\\\*



boolean



Whether the channel select is required to answer in a modal (defaults to `true`)



disabled?\\\*\\\*



boolean



Whether select menu is disabled in a message (defaults to `false`)



\\\* The `required` field is only available for Channel Selects in modals. It is ignored in messages.



\\\*\\\* Using `disabled` in a modal will result in an error. Modals can not currently have disabled components in them.



\###### Channel Select Interaction Response Structure\[



](#channel-select-channel-select-interaction-response-structure)



Field



Type



Description



type\\\*



integer



`8` for a Channel Select



component\\\_type\\\*



integer



`8` for a Channel Select



id



integer



Unique identifier for the component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



resolved



\[resolved data](/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure)



Resolved entities from selected options



values



array of snowflakes



IDs of the selected channels



\\\* In message interaction responses `component\_type` will be returned and in modal interaction responses `type` will be returned.



\###### Examples\[



](#channel-select-examples)



Message Example



Message create payload with a Channel Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a Channel Select for text channels](/assets/49d203fd660a5157.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1,  // ComponentType.ACTION\_ROW

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 8,  // ComponentType.CHANNEL\_SELECT

&nbsp;             "custom\_id": "notification\_channel",

&nbsp;             "channel\_types": \[0],  // ChannelType.TEXT

&nbsp;             "placeholder": "Which text channel?"

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



Message Interaction Data Example



When a user interacts with a Channel Select in a message



When a user interacts with a Channel Select in a message, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 3, // InteractionType.MESSAGE\_COMPONENT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "component\_type": 8, // ComponentType.CHANNEL\_SELECT

&nbsp;       "id": 2,

&nbsp;       "custom\_id": "notification\_channel",

&nbsp;       "values": \[

&nbsp;         "333333333333333333",

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "channels": {

&nbsp;           "333333333333333333": {

&nbsp;             "flags": 0,

&nbsp;             "guild\_id": "44444444444444444",

&nbsp;             "id": "333333333333333333",

&nbsp;             "last\_message\_id": null,

&nbsp;             "name": "playtesting",

&nbsp;             "nsfw": false,

&nbsp;             "parent\_id": "5555555555555555",

&nbsp;             "permissions": "4503599627370495",

&nbsp;             "position": 1,

&nbsp;             "rate\_limit\_per\_user": 0,

&nbsp;             "topic": null,

&nbsp;             "type": 0  // ChannelType.TEXT

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     },

&nbsp;   }

&nbsp;   



Modal Example



Modal create payload with a Channel Select component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a modal with a Channel Select](/assets/2ed1bca32907fcd7.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9,

&nbsp;     "data": {

&nbsp;       "custom\_id": "channel\_modal",

&nbsp;       "title": "Lockdown",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18,

&nbsp;           "label": "Which channel should be locked?",

&nbsp;           "component": {

&nbsp;             "type": 8,

&nbsp;             "custom\_id": "channel\_selected",

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



Modal Submit Interaction Data Example



When a user submits a modal containing a Channel Select



When a user submits a modal that contains a Channel Select, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 5, // InteractionType.MODAL\_SUBMIT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "custom\_id": "channel\_modal",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "component": {

&nbsp;             "custom\_id": "channel\_selected",

&nbsp;             "id": 2,

&nbsp;             "type": 8,

&nbsp;             "values": \[

&nbsp;               "1357483683627663450"

&nbsp;             ]

&nbsp;           },

&nbsp;           "id": 1,

&nbsp;           "type": 18

&nbsp;         }

&nbsp;       ],

&nbsp;       "resolved": {

&nbsp;         "channels": {

&nbsp;           "1357483683627663450": {

&nbsp;             "flags": 0,

&nbsp;             "guild\_id": "1111111111111111",

&nbsp;             "id": "1357483683627663450",

&nbsp;             "last\_message\_id": null,

&nbsp;             "name": "playtesting",

&nbsp;             "nsfw": false,

&nbsp;             "parent\_id": "1357129309164404938",

&nbsp;             "permissions": "4503599627370495",

&nbsp;             "position": 1,

&nbsp;             "rate\_limit\_per\_user": 0,

&nbsp;             "topic": null,

&nbsp;             "type": 0

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp;   



\* \* \*



Section\[



](#section)

---------------------



A Section is a top-level layout component that allows you to contextually associate content with an accessory component. The typical use-case is to contextually associate \[text content](/developers/docs/components/reference#text-display) with an \[accessory](/developers/docs/components/reference#section-section-accessory-components).



Sections are currently only available in messages.



To use this component in messages you must send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2) which can be activated on a per-message basis.



\###### Section Structure\[



](#section-section-structure)



Field



Type



Description



type



integer



`9` for section component



id?



integer



Optional identifier for component



components



array of \[section child components](/developers/docs/components/reference#section-section-child-components)



One to three child components representing the content of the section that is contextually associated to the accessory



accessory



\[section accessory component](/developers/docs/components/reference#section-section-accessory-components)



A component that is contextually associated to the content of the section



Don't hardcode `components` to contain only text components. We may add other components in the future. Similarly, `accessory` may be expanded to include other components in the future.



\###### Section Child Components\[



](#section-section-child-components)



Available Components



\[Text Display](/developers/docs/components/reference#text-display)



\###### Section Accessory Components\[



](#section-section-accessory-components)



Available Components



\[Button](/developers/docs/components/reference#button)



\[Thumbnail](/developers/docs/components/reference#thumbnail)



\###### Examples\[



](#section-examples)



Message Example



Message create payload with a Section (and Thumbnail) component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a Section showing a fake game changelog and a thumbnail](/assets/916783d782c2ce74.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 9,  // ComponentType.SECTION

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "# Real Game v7.3"

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "Hope you're excited, the update is finally here! Here are some of the changes:\\n- Fixed a bug where certain treasure chests wouldn't open properly\\n- Improved server stability during peak hours\\n- Added a new type of gravity that will randomly apply when the moon is visible in-game\\n- Every third thursday the furniture will scream your darkest secrets to nearby npcs"

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "-# That last one wasn't real, but don't use voice chat near furniture just in case..."

&nbsp;           }

&nbsp;         ],

&nbsp;         "accessory": {

&nbsp;           "type": 11,  // ComponentType.THUMBNAIL

&nbsp;           "media": {

&nbsp;             "url": "https://websitewithopensourceimages/gamepreview.webp"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



\* \* \*



Text Display\[



](#text-display)

-------------------------------



A Text Display is a content component that allows you to add markdown formatted text, including mentions (users, roles, etc) and emojis. The behavior of this component is extremely similar to the \[`content` field of a message](/developers/docs/resources/message#message-object), but allows you to add multiple text components, controlling the layout of your message.



When sent in a message, pingable mentions (@user, @role, etc) present in this component will ping and send notifications based on the value of the \[allowed mention object](/developers/docs/resources/message#allowed-mentions-object) set in \[`message.allowed\_mentions`](/developers/docs/resources/message#message-object).



To use this component in messages you must send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2) which can be activated on a per-message basis.



\###### Text Display Structure\[



](#text-display-text-display-structure)



Field



Type



Description



type



integer



`10` for text display



id?



integer



Optional identifier for component



content



string



Text that will be displayed similar to a message



\###### Text Display Interaction Response Structure\[



](#text-display-text-display-interaction-response-structure)



Field



Type



Description



type



integer



`10` for a Text Display



id



integer



Unique identifier for the component



\###### Examples\[



](#text-display-examples)



Message Example



Message create payload with a Text Display component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a Text Display with markdown](/assets/e0fe2d6c6efe5f34.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;         "content": "# This is a Text Display\\nAll the regular markdown rules apply\\n- You can make lists\\n- You can use `code blocks`\\n- You can use \[links](http://watchanimeattheoffice.com/)\\n- Even :blush: :star\_struck: :exploding\_head:\\n- Spoiler alert: ||these too!||"

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



Modal Example



Modal create payload with a Text Display component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a modal with a Text Display](/assets/c71291d0cadeeda4.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9,

&nbsp;     "data": {

&nbsp;       "custom\_id": "jail\_modal",

&nbsp;       "title": "Jail",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 10,

&nbsp;           "content": "This action will move the selected user to the selected voice channel and take away all their permissions \*\*for 1 hour\*\*."

&nbsp;         },

&nbsp;         {

&nbsp;           "type": 18,

&nbsp;           "label": "Choose a user",

&nbsp;           "component": {

&nbsp;             "type": 5,

&nbsp;             "custom\_id": "user\_selected",

&nbsp;             "required": true

&nbsp;           }

&nbsp;         },

&nbsp;         {

&nbsp;           "type": 18,

&nbsp;           "label": "Where should they be sent?",

&nbsp;           "component": {

&nbsp;             "type": 8,

&nbsp;             "custom\_id": "channel\_selected",

&nbsp;             "channel\_types": \[

&nbsp;               2

&nbsp;             ],

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



\* \* \*



Thumbnail\[



](#thumbnail)

-------------------------



A Thumbnail is a content component that displays visual media in a small form-factor. It is intended as an accessory for to other content, and is primarily usable with \[sections](/developers/docs/components/reference#section). The media displayed is defined by the \[unfurled media item](/developers/docs/components/reference#unfurled-media-item) structure, which supports both uploaded media and externally hosted media.



Thumbnails are currently only available in messages as an accessory in a \[section](/developers/docs/components/reference#section).



Thumbnails currently only support images, including animated formats like GIF and WEBP. Videos are not supported at this time.



To use this component, you need to send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2), which can be activated on a per-message basis.



\###### Thumbnail Structure\[



](#thumbnail-thumbnail-structure)



Field



Type



Description



type



integer



`11` for thumbnail component



id?



integer



Optional identifier for component



media



\[unfurled media item](/developers/docs/components/reference#unfurled-media-item)



A url or attachment provided as an \[unfurled media item](/developers/docs/components/reference#unfurled-media-item)



description?



?string



Alt text for the media, max 1024 characters



spoiler?



boolean



Whether the thumbnail should be a spoiler (or blurred out). Defaults to `false`



\###### Examples\[



](#thumbnail-examples)



Message Example



Message create payload with a Thumbnail component (via Section)



Rendered Example



Visualization of the message created by the payload below



!\[Example of a Section showing a fake game changelog and a thumbnail](/assets/916783d782c2ce74.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 9,  // ComponentType.SECTION

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "# Real Game v7.3"

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "Hope you're excited, the update is finally here! Here are some of the changes:\\n- Fixed a bug where certain treasure chests wouldn't open properly\\n- Improved server stability during peak hours\\n- Added a new type of gravity that will randomly apply when the moon is visible in-game\\n- Every third thursday the furniture will scream your darkest secrets to nearby npcs"

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "-# That last one wasn't real, but don't use voice chat near furniture just in case..."

&nbsp;           }

&nbsp;         ],

&nbsp;         "accessory": {

&nbsp;           "type": 11,  // ComponentType.THUMBNAIL

&nbsp;           "media": {

&nbsp;             "url": "https://websitewithopensourceimages/gamepreview.webp"

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



\* \* \*



Media Gallery\[



](#media-gallery)

---------------------------------



A Media Gallery is a top-level content component that allows you to display 1-10 media attachments in an organized gallery format. Each item can have optional descriptions and can be marked as spoilers.



Media Galleries are currently only available in messages.



To use this component in messages you must send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2) which can be activated on a per-message basis.



\###### Media Gallery Structure\[



](#media-gallery-media-gallery-structure)



Field



Type



Description



type



integer



`12` for media gallery component



id?



integer



Optional identifier for component



items



array of \[media gallery items](/developers/docs/components/reference#media-gallery-media-gallery-item-structure)



1 to 10 media gallery items



\###### Media Gallery Item Structure\[



](#media-gallery-media-gallery-item-structure)



Field



Type



Description



media



\[unfurled media item](/developers/docs/components/reference#unfurled-media-item)



A url or attachment provided as an \[unfurled media item](/developers/docs/components/reference#unfurled-media-item)



description?



?string



Alt text for the media, max 1024 characters



spoiler?



boolean



Whether the media should be a spoiler (or blurred out). Defaults to `false`



\###### Examples\[



](#media-gallery-examples)



Message Example



Message create payload with a Media Gallery component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a Media Gallery showing screenshots from live webcam feeds](/assets/72a76ae9eaf0f3fa.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;         "content": "Live webcam shots as of 18-04-2025 at 12:00 UTC"

&nbsp;       },

&nbsp;       {

&nbsp;         "type": 12,  // ComponentType.MEDIA\_GALLERY

&nbsp;         "items": \[

&nbsp;           {

&nbsp;             "media": {"url": "https://livevideofeedconvertedtoimage/webcam1.webp"},

&nbsp;             "description": "An aerial view looking down on older industrial complex buildings. The main building is white with many windows and pipes running up the walls."

&nbsp;           },

&nbsp;           {

&nbsp;             "media": {"url": "https://livevideofeedconvertedtoimage/webcam2.webp"},

&nbsp;             "description": "An aerial view of old broken buildings. Nature has begun to take root in the rooftops. A portion of the middle building's roof has collapsed inward. In the distant haze you can make out a far away city."

&nbsp;           },

&nbsp;           {

&nbsp;             "media": {"url": "https://livevideofeedconvertedtoimage/webcam3.webp"},

&nbsp;             "description": "A street view of a downtown city. Prominently in photo are skyscrapers and a domed building"

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



\* \* \*



File\[



](#file)

---------------



A File is a top-level content component that allows you to display an \[uploaded file](/developers/docs/components/reference#uploading-a-file) as an attachment to the message and reference it in the component. Each file component can only display 1 attached file, but you can upload multiple files and add them to different file components within your payload.



Files are currently only available in messages.



The File component only supports using the `attachment://` protocol in \[unfurled media item](/developers/docs/components/reference#unfurled-media-item)



To use this component in messages you must send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2) which can be activated on a per-message basis.



\###### File Structure\[



](#file-file-structure)



Field



Type



Description



type



integer



`13` for a file component



id?



integer



Optional identifier for component



file



\[unfurled media item](/developers/docs/components/reference#unfurled-media-item)



This unfurled media item is unique in that it only supports attachment references using the `attachment://<filename>` syntax



spoiler?



boolean



Whether the media should be a spoiler (or blurred out). Defaults to `false`



name



string



The name of the file. This field is ignored and provided by the API as part of the response



size



integer



The size of the file in bytes. This field is ignored and provided by the API as part of the response



\###### Examples\[



](#file-examples)



Message Example



Message create payload with a File component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a File showing a download for a game and manual](/assets/0d8913a00f3ec8e6.webp)



This example makes use of the `attachment://` protocol functionality in \[unfurled media item](/developers/docs/components/reference#unfurled-media-item).



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;         "content": "# New game version released for testing!\\nGrab the game here:"

&nbsp;       },

&nbsp;       {

&nbsp;         "type": 13,  // ComponentType.FILE

&nbsp;         "file": {

&nbsp;           "url": "attachment://game.zip"

&nbsp;         }

&nbsp;       },

&nbsp;       {

&nbsp;         "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;         "content": "Latest manual artwork here:"

&nbsp;       },

&nbsp;       {

&nbsp;         "type": 13,  // ComponentType.FILE

&nbsp;         "file": {

&nbsp;           "url": "attachment://manual.pdf"

&nbsp;         }

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



\* \* \*



Separator\[



](#separator)

-------------------------



A Separator is a top-level layout component that adds vertical padding and visual division between other components.



Separators are currently only available in messages.



To use this component in messages you must send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2) which can be activated on a per-message basis.



\###### Separator Structure\[



](#separator-separator-structure)



Field



Type



Description



type



integer



`14` for separator component



id?



integer



Optional identifier for component



divider?



boolean



Whether a visual divider should be displayed in the component. Defaults to `true`



spacing?



integer



Size of separator padding—`1` for small padding, `2` for large padding. Defaults to `1`



\###### Examples\[



](#separator-examples)



Message Example



Message create payload with a Separator component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a separator with large spacing dividing content](/assets/025b2ac25ef51c7a.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;         "content": "It's dangerous to go alone!"

&nbsp;       },

&nbsp;       {

&nbsp;         "type": 14,  // ComponentType.SEPARATOR

&nbsp;         "divider": true,

&nbsp;         "spacing": 1

&nbsp;       },

&nbsp;       {

&nbsp;         "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;         "content": "Take this."

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



\* \* \*



Container\[



](#container)

-------------------------



A Container is a top-level layout component. Containers offer the ability to visually encapsulate a collection of components and have an optional customizable accent color bar.



Containers are currently only available in messages.



To use this component in messages you must send the \[message flag](/developers/docs/resources/message#message-object-message-flags) `1 << 15` (IS\\\_COMPONENTS\\\_V2) which can be activated on a per-message basis.



\###### Container Structure\[



](#container-container-structure)



Field



Type



Description



type



integer



`17` for container component



id?



integer



Optional identifier for component



components



array of \[container child components](/developers/docs/components/reference#container-container-child-components)



Child components that are encapsulated within the Container



accent\\\_color?



?integer



Color for the accent on the container as RGB from `0x000000` to `0xFFFFFF`



spoiler?



boolean



Whether the container should be a spoiler (or blurred out). Defaults to `false`.



\###### Container Child Components\[



](#container-container-child-components)



Available Components



\[Action Row](/developers/docs/components/reference#action-row)



\[Text Display](/developers/docs/components/reference#text-display)



\[Section](/developers/docs/components/reference#section)



\[Media Gallery](/developers/docs/components/reference#media-gallery)



\[Separator](/developers/docs/components/reference#separator)



\[File](/developers/docs/components/reference#file)



\###### Examples\[



](#container-examples)



Message Example



Message create payload with a Container component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a container showing text, image, and buttons for a wild enemy encounter](/assets/61c01e689fabb151.webp)



Copy



&nbsp;   {

&nbsp;     "flags": 32768,

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 17,  // ComponentType.CONTAINER

&nbsp;         "accent\_color": 703487,

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "# You have encountered a wild coyote!"

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 12,  // ComponentType.MEDIA\_GALLERY

&nbsp;             "items": \[

&nbsp;               {

&nbsp;                 "media": {"url": "https://websitewithopensourceimages/coyote.webp"},

&nbsp;               }

&nbsp;             ]

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 10,  // ComponentType.TEXT\_DISPLAY

&nbsp;             "content": "What would you like to do?"

&nbsp;           },

&nbsp;           {

&nbsp;             "type": 1,  // ComponentType.ACTION\_ROW

&nbsp;             "components": \[

&nbsp;               {

&nbsp;                 "type": 2,  // ComponentType.BUTTON

&nbsp;                 "custom\_id": "pet\_coyote",

&nbsp;                 "label": "Pet it!",

&nbsp;                 "style": 1

&nbsp;               },

&nbsp;               {

&nbsp;                 "type": 2,  // ComponentType.BUTTON

&nbsp;                 "custom\_id": "feed\_coyote",

&nbsp;                 "label": "Attempt to feed it",

&nbsp;                 "style": 2

&nbsp;               },

&nbsp;               {

&nbsp;                 "type": 2,  // ComponentType.BUTTON

&nbsp;                 "custom\_id": "run\_away",

&nbsp;                 "label": "Run away!",

&nbsp;                 "style": 4

&nbsp;               }

&nbsp;             ]

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   



\* \* \*



Label\[



](#label)

-----------------



A Label is a top-level layout component. Labels wrap modal components with text as a label and optional description.



The `description` may display above or below the `component` depending on the platform.



\###### Label Structure\[



](#label-label-structure)



Field



Type



Description



type



integer



`18` for a label



id?



integer



Optional identifier for component



label



string



The label text; max 45 characters



description?



string



An optional description text for the label; max 100 characters



component



\[label child component](/developers/docs/components/reference#label-label-child-components)



The component within the label



\###### Label Child Components\[



](#label-label-child-components)



Available Components



\[Text Input](/developers/docs/components/reference#text-input)



\[String Select](/developers/docs/components/reference#string-select)



\[User Select](/developers/docs/components/reference#user-select)



\[Role Select](/developers/docs/components/reference#role-select)



\[Mentionable Select](/developers/docs/components/reference#mentionable-select)



\[Channel Select](/developers/docs/components/reference#channel-select)



\[File Upload](/developers/docs/components/reference#file-upload)



\###### Label Interaction Response Structure\[



](#label-label-interaction-response-structure)



Field



Type



Description



type



integer



`18` for a Label



id



integer



Unique identifier for the component



component



\[label interaction response child component](/developers/docs/components/reference#label-label-interaction-response-child-components)



The component within the label



\###### Label Interaction Response Child Components\[



](#label-label-interaction-response-child-components)



Available Components



\[Text Input](/developers/docs/components/reference#text-input-text-input-interaction-response-structure)



\[String Select](/developers/docs/components/reference#string-select-string-select-interaction-response-structure)



\[User Select](/developers/docs/components/reference#user-select-user-select-interaction-response-structure)



\[Role Select](/developers/docs/components/reference#role-select-role-select-interaction-response-structure)



\[Mentionable Select](/developers/docs/components/reference#mentionable-select-mentionable-select-interaction-response-structure)



\[Channel Select](/developers/docs/components/reference#channel-select-channel-select-interaction-response-structure)



\[File Upload](/developers/docs/components/reference#file-upload-file-upload-interaction-response-structure)



\###### Examples\[



](#label-examples)



Modal Example



Modal create payload with a Label component (wrapping a Text Input)



Rendered Example



Visualization of the modal created by the payload below



!\[A modal with Text Input in a Label](/assets/4561c3530edbb293.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9, // InteractionCallbackType.MODAL

&nbsp;     "data": {

&nbsp;       "custom\_id": "game\_feedback\_modal",

&nbsp;       "title": "Game Feedback",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18,  // ComponentType.LABEL

&nbsp;           "label": "What did you find interesting about the game?",

&nbsp;           "description": "Please give us as much detail as possible so we can improve the game!",

&nbsp;           "component": {

&nbsp;             "type": 4,  // ComponentType.TEXT\_INPUT

&nbsp;             "custom\_id": "game\_feedback",

&nbsp;             "style": 2,

&nbsp;             "min\_length": 100,

&nbsp;             "max\_length": 4000,

&nbsp;             "placeholder": "Write your feedback here...",

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



\* \* \*



File Upload\[



](#file-upload)

-----------------------------



File Upload is an interactive component that allows users to upload files in modals. File Uploads can be configured to have a minimum and maximum number of files between 0 and 10, along with `required` for if the upload is required to submit the modal. The max file size a user can upload is based on the user's upload limit in that channel.



File Uploads are available on modals. They must be placed inside a \[Label](/developers/docs/components/reference#label).



\###### File Upload Structure\[



](#file-upload-file-upload-structure)



Field



Type



Description



type



integer



`19` for file upload



id?



integer



Optional identifier for component



custom\\\_id



string



ID for the file upload; 1-100 characters



min\\\_values?



integer



Minimum number of items that must be uploaded (defaults to 1); min 0, max 10



max\\\_values?



integer



Maximum number of items that can be uploaded (defaults to 1); max 10



required?



boolean



Whether the file upload requires files to be uploaded before submitting the modal (defaults to `true`)



\###### File Upload Interaction Response Structure\[



](#file-upload-file-upload-interaction-response-structure)



Field



Type



Description



type



integer



`19` for a File Upload



id



integer



Unique identifier for the component



custom\\\_id



string



Developer-defined identifier for the input; 1-100 characters



values



array of snowflakes



IDs of the uploaded files found in the \[resolved data](/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure)



\###### Examples\[



](#file-upload-examples)



Modal Example



Modal create payload with a File Upload component



Rendered Example



Visualization of the message created by the payload below



!\[Example of a modal with a File Upload](/assets/347d697a4049b2c1.webp)



Copy



&nbsp;   {

&nbsp;     "type": 9,

&nbsp;     "data": {

&nbsp;       "custom\_id": "bug\_submit\_modal",

&nbsp;       "title": "Bug Submission",

&nbsp;       "components": \[

&nbsp;         {

&nbsp;           "type": 18, // ComponentType.LABEL

&nbsp;           "label": "File Upload",

&nbsp;           "description": "Please upload a screenshot or other image that shows the bug you encountered.",

&nbsp;           "component": {

&nbsp;             "type": 19, // ComponentType.FILE\_UPLOAD

&nbsp;             "custom\_id": "file\_upload",

&nbsp;             "min\_values": 1,

&nbsp;             "max\_values": 10,

&nbsp;             "required": true

&nbsp;           }

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;   }

&nbsp;   



Modal Submit Interaction Data Example



When a user submits a modal containing a File Upload



When a user submits a modal that contains a File Upload, this is the basic form of the interaction data payload you will receive. The full payload is available in the \[interaction](/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure) reference.



Copy



&nbsp;   {

&nbsp;     "type": 5, // InteractionType.MODAL\_SUBMIT

&nbsp;     ...additionalInteractionFields, // See the Interaction documentation for all fields

&nbsp;   

&nbsp;     "data": {

&nbsp;       "components": \[

&nbsp;         {

&nbsp;             "component": {

&nbsp;                 "custom\_id": "file\_upload",

&nbsp;                 "id": 2,

&nbsp;                 "type": 19,

&nbsp;                 "values": \[

&nbsp;                     "111111111111111111111"

&nbsp;                 ]

&nbsp;             },

&nbsp;             "id": 1,

&nbsp;             "type": 18

&nbsp;         }

&nbsp;       ],

&nbsp;       "custom\_id": "bug\_submit\_modal",

&nbsp;       "resolved": {

&nbsp;         "attachments": {

&nbsp;           "111111111111111111111": {

&nbsp;               "content\_type": "image/png",

&nbsp;               "ephemeral": true,

&nbsp;               "filename": "bug.png",

&nbsp;               "height": 604,

&nbsp;               "id": "111111111111111111111",

&nbsp;               "placeholder": "/PcBAoBQydvKesabEIoMsdg=",

&nbsp;               "placeholder\_version": 1,

&nbsp;               "proxy\_url": "https://media.discordapp.net/ephemeral-attachments/2222222222222222222/111111111111111111111/bug.png?ex=68dc7ce1\&is=68db2b61\&hm=5954f90117ccf8716ffa6c7f97a778a0d039810c9584045f400d8a9fff590768\&",

&nbsp;               "size": 241394,

&nbsp;               "url": "https://cdn.discordapp.com/ephemeral-attachments/2222222222222222222/111111111111111111111/bug.png?ex=68dc7ce1\&is=68db2b61\&hm=5954f90117ccf8716ffa6c7f97a778a0d039810c9584045f400d8a9fff590768\&",

&nbsp;               "width": 2482

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp;   



\* \* \*



Unfurled Media Item\[



](#unfurled-media-item)

---------------------------------------------



An Unfurled Media Item is a piece of media, represented by a URL, that is used within a component. It can be constructed via either uploading media to Discord, or by referencing external media via a direct link to the asset.



While the structure below is the full representation of an Unfurled Media Item, only the `url` field is settable by developers when making requests that utilize this structure.



\###### Unfurled Media Item Structure\[



](#unfurled-media-item-unfurled-media-item-structure)



Field



Type



Description



url



string



Supports arbitrary urls and `attachment://<filename>` references



proxy\\\_url?



string



The proxied url of the media item. This field is ignored and provided by the API as part of the response



height?



?integer



The height of the media item. This field is ignored and provided by the API as part of the response



width?



?integer



The width of the media item. This field is ignored and provided by the API as part of the response



content\\\_type?



string



The \[media type](https://en.wikipedia.org/wiki/Media\_type) of the content. This field is ignored and provided by the API as part of the response



attachment\\\_id?\\\*



snowflake



The id of the uploaded attachment. This field is ignored and provided by the API as part of the response



\\\* Only present if the media item was uploaded as an attachment.



\### Uploading a file\[



](#uploading-a-file)



To upload a file with your message, you'll need to send your payload as `multipart/form-data` (rather than `application/json`) and include your file with a valid filename in your payload. Details and examples for uploading files can be found in the \[API Reference](/developers/docs/reference#uploading-files).



Legacy Message Component Behavior\[



](#legacy-message-component-behavior)

-------------------------------------------------------------------------



Before the introduction of the `IS\_COMPONENTS\_V2` flag (\[see changelog](/developers/docs/change-log/2025-04-22-components-v2)), message components were sent in conjunction with message content. This means that you could send a message using a subset of the available components without setting the `IS\_COMPONENTS\_V2` flag, and the components would be included in the message content along with `content` and `embeds`.



Additionally, components of messages preceding components V2 will contain an `id` of `0`.



Apps using this Legacy Message Component behavior will continue to work as expected, but it is recommended to use the new `IS\_COMPONENTS\_V2` flag for new apps or features as they offer more options for layout and customization.



Legacy messages allow up to 5 action rows as top-level components



Legacy Message Component Example



Copy



&nbsp;   {

&nbsp;     "content": "This is a message with legacy components",

&nbsp;     "components": \[

&nbsp;       {

&nbsp;         "type": 1,

&nbsp;         "components": \[

&nbsp;           {

&nbsp;             "type": 2,

&nbsp;             "style": 1,

&nbsp;             "label": "Click Me",

&nbsp;             "custom\_id": "click\_me\_1"

&nbsp;           }

&nbsp;         ]

&nbsp;       }

&nbsp;     ]

&nbsp;   }

