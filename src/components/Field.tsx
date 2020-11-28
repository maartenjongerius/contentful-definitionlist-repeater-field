import React, {useCallback, useState} from 'react';
import { FieldGroup, Subheading, TextInput, Form, Button } from '@contentful/forma-36-react-components';
import { List as MovableList, arrayMove, arrayRemove } from 'react-movable'
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import styled from 'styled-components'

interface FieldProps {
    sdk: FieldExtensionSDK;
}

interface DefinitionListInterface {
    term: string,
    details: string
}

const DefinitionList = styled.div`
`

const DefinitionListItem = styled.div`
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
    margin-bottom: 1rem;
    padding: .875rem;
    border: 1px solid #d3dce0;
    border-radius: 4px;
    text-decoration: none;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,.08);
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    font-size: .875rem;
    line-height: 1.5;
    color: #192532;
    transition: box-shadow .1s ease-in-out,border-color .2s ease-in-out;
    position: relative;
    cursor: grabbing;
    
    ${DefinitionList} & {
      cursor: grab;
    }
`

const DefinitionListItemTerms = styled.div`
    margin: 0 0 .25rem;
    font-size: 1rem;
    line-height: 1.5;
    word-break: break-word;
    text-overflow: ellipsis;
    overflow: hidden;
    color: #192532;
    font-weight: 700
`

const DefinitionListItemDetails = styled.div`
    color: #606c7c;
    font-size: 1rem;
    word-break: break-word
`

const DefinitionListItemDelete = styled.button`
    border: 0;
    background: transparent;
    font-weight: 600;
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .1rem;
    line-height: 1.5; 
    padding: .875rem;
    cursor: pointer;
    color: #192532;
    
    &:hover {
      background: #f7f9fa;
    }
    
    &:active {
        background: #e5ebed;
    }
    
    ${DefinitionListItem} & {
      position: absolute;
      top: 50%;
      right: .875rem;
      transform: translateY(-50%);
    }
`

const Field = (props: FieldProps) => {
    // If you only want to extend Contentful's default editing experience
    // reuse Contentful's editor components
    // -> https://www.contentful.com/developers/docs/extensibility/field-editors/
    const { sdk: { field, window } } = props
    window.startAutoResizer();
    const [value, setValue] = useState(field.getValue())
    const [formValues, setFormValues] = useState({term: undefined, details: undefined})

    const onClickDelete = async (index: number) => {
        const newValue = {
            values: arrayRemove(value.values, index)
        }
        setValue(newValue)
        await field.setValue(newValue)
    }

    const onChangeList = useCallback(async ({ oldIndex, newIndex }) => {
        const newValue = {
            values: arrayMove(value.values, oldIndex, newIndex)
        }
        setValue(newValue)
        await field.setValue(newValue)
    }, [value, setValue, field])

    const onSubmit = useCallback(async (...args) => {
        const newValue = {
            values: [
                ...value.values,
                {
                    ...formValues
                }
            ]
        }
        setValue(newValue)
        await field.setValue(newValue)
    }, [formValues, value.values, setValue, field])

    const onChangeFormField = useCallback(async ({target: {name, value}}) => {
        setFormValues({
            ...formValues,
            [name]: value
        })
    }, [formValues, setFormValues])

    return (
        <>
            <Subheading>Values (drag to re-order)</Subheading>
            <MovableList
                lockVertically
                values={value.values as DefinitionListInterface[]}
                onChange={onChangeList}
                renderList={
                    ({ children, props }) => (
                        <DefinitionList {...props}>{children}</DefinitionList>
                    )}
                renderItem={
                    ({ index, props }) => (
                        <DefinitionListItem
                            {...props}
                        >
                            <DefinitionListItemTerms>{value.values[index as number].term}</DefinitionListItemTerms>
                            <DefinitionListItemDetails>{value.values[index as number].details}</DefinitionListItemDetails>
                            <DefinitionListItemDelete onClick={() => onClickDelete(index as number)}>
                                Delete
                            </DefinitionListItemDelete>
                        </DefinitionListItem>
                    )}
            />
            <Subheading>Add new value</Subheading>
            <Form onSubmit={onSubmit}>
                <FieldGroup row>
                    <TextInput
                        willBlurOnEsc
                        id="newTerm"
                        name="term"
                        onChange={onChangeFormField}
                        placeholder="Term"
                    />
                    <TextInput
                        willBlurOnEsc
                        id="newDetails"
                        name="details"
                        onChange={onChangeFormField}
                        placeholder="Details"
                    />
                    <Button
                        type="submit"
                        buttonType="positive"
                    >Add</Button>
                </FieldGroup>
            </Form>
        </>
    )
};

export default Field;
