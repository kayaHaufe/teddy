import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ParceirosService from "../../../services/parceiros.service";
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

export default function Tabela() {
    let emptyProduct = {
        name: "",
        description: "",
        client: "",
        client2: "",
    };

    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const getParceiros = () => {
        ParceirosService.getParceiros().then((data) => setProducts(data.data));
    }

    useEffect(() => {
        getParceiros();
    }, []);

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);

        // Definir os arrays de clients e projects
        product.clients = [product.client, product.client2];
        product.projects = [product.project, product.project2];

        // Remover os campos temporários
        delete product.client;
        delete product.client2;
        delete product.project;
        delete product.project2;

        setProductDialog(false);

        if (product.id) {
            ParceirosService.putParceiro(product.id, product).then((response) => {
                const savedProduct = response.data; // Dados completos vindos do backend

                let _products = [...products];

                const index = findIndexById(product.id);
                _products[index] = savedProduct; // Atualizar o produto com os dados do backend
                toast.current.show({ severity: 'success', summary: 'Sucesso!', detail: 'Parceiro Atualizado', life: 3000 });

                setProducts(_products);
                setProduct(emptyProduct);
            }).catch(error => {
                // Tratar erro, se necessário
                console.error("Erro ao salvar parceiro", error);
            });
        } else {
            ParceirosService.postParceiro(product).then((response) => {
                const savedProduct = response.data; // Dados completos vindos do backend

                let _products = [...products];

                _products.push(savedProduct); // Adicionar o novo produto com os dados completos
                toast.current.show({ severity: 'success', summary: 'Sucesso!', detail: 'Parceiro Cadastrado', life: 3000 });

                setProducts(_products);
                setProduct(emptyProduct);
            }).catch(error => {
                // Tratar erro, se necessário
                console.error("Erro ao salvar parceiro", error);
            });
        }
    };


    const editProduct = (product) => {
        product.client = product.clients[0];
        product.client2 = product.clients[1];
        product.project = product.projects[0];
        product.project2 = product.projects[1];

        setProduct({ ...product });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        let _products = products.filter((val) => val.id !== product.id);

        setProducts(_products);
        setDeleteProductDialog(false);
        ParceirosService.deleteParceiroById(product.id).then(() => toast.current.show({ severity: 'success', summary: 'Sucesso!', detail: 'Parceiro deletado.', life: 3000 }));
    };

    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };

        _product[`${name}`] = val;

        setProduct(_product);
    };

    const toolbarTemplate = () => {
        return (
            <Button label="Adicionar Parceiro" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProduct(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="c-6 flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Parceiros</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </IconField>
        </div>
    );
    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Confirmar" icon="pi pi-check" onClick={saveProduct} />
        </React.Fragment>
    );
    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
            <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
        </React.Fragment>
    );

    const formatArray = (rowData, attribute) => {
        return rowData[attribute]?.map((item, index) => (
            <React.Fragment key={index}>
                {item}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar center={toolbarTemplate}></Toolbar>

                <DataTable ref={dt} value={products} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} ao {last} de {totalRecords} parceiros" globalFilter={globalFilter} header={header}>
                    <Column field="id" header="Código" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="name" header="Nome" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="description" header="Descrição" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column header="Clientes" body={(rowData) => formatArray(rowData, "clients")} sortable style={{ minWidth: '10rem' }}></Column>
                    <Column header="Projetos" body={(rowData) => formatArray(rowData, "projects")} sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={productDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Dados do Parceiro" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Nome
                    </label>
                    <InputText id="name" value={product.name} onChange={(e) => onInputChange(e, 'name')} autoFocus />
                </div>
                <div className="field">
                    <label htmlFor="description" className="font-bold">
                        Descrição
                    </label>
                    <InputTextarea id="description" value={product.description} onChange={(e) => onInputChange(e, 'description')} rows={3} cols={20} />
                </div>
                <div className="field">
                    <label htmlFor="client" className="font-bold">
                        Cliente
                    </label>
                    <InputText id="client" value={product.client} onChange={(e) => onInputChange(e, 'client')} />
                </div>
                <div className="field">
                    <label htmlFor="client2" className="font-bold">
                        Cliente 2
                    </label>
                    <InputText id="client2" value={product.client2} onChange={(e) => onInputChange(e, 'client2')} />
                </div>
                <div className="field">
                    <label htmlFor="project" className="font-bold">
                        Projeto
                    </label>
                    <InputText id="project" value={product.project} onChange={(e) => onInputChange(e, 'project')} />
                </div>
                <div className="field">
                    <label htmlFor="project2" className="font-bold">
                        Projeto 2
                    </label>
                    <InputText id="project2" value={product.project2} onChange={(e) => onInputChange(e, 'project2')} />
                </div>

            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span>
                            Tem certeza que deseja excluir o seguinte parceiro: <br></br><b>{product.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
